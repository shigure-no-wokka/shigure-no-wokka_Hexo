---
title: UE 渲染：Shader
date: 2024-05-07 23:45
description: 
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_engine.jpg
categories: 软件知识
tags:
  - UE
  - 渲染
---

# Shaders and Vertex Data

在 UE 中有三个线程，GameThread、RenderingThread 和 RHIThread
- GameThread 负责给 RenderingThread 提供渲染数据和渲染命令
- RHIThread 负责接收 RenderingThread 提供的渲染资源，并发送资源以及相关指令给 GPU 进行渲染

ShaderCode 的生成发生在渲染线程（RenderingThread）

## Shader 的创建与编译

### Shader

在 UE 中，`FShader` 是所有 shader 的基类，每一个 `FShader` 类都有一个对应的 `FShaderResource` 负责记录这个 shader 对应的 GPU 资源。

从 `FShader` 派生出两个主要的 Shader 类：`FGlobalShader` 和 `FMaterialShader`

#### FGlobalShader

任意一个 `FGlobalShader` 类型的着色器在内存中只有一个实例，它会把所有继承子类加入一个重编译的 Group 内（个人理解：这个 shader 类管理的，是 UE 引擎中默认自带的一些 Shader）

官方文档对 `FGlobalShader` 的描述：[Adding Global Shaders to Unreal Engine | Unreal Engine 5.4 Documentation | Epic Developer Community](https://dev.epicgames.com/documentation/en-us/unreal-engine/adding-global-shaders-to-unreal-engine)

> `FGlobalShader` 是对固定几何体（如屏幕四边形）执行操作并且**不需要与材质交互**的着色器。在内存中，对于任何给定的全局着色器类型，只有一个实例。

#### FMaterialShader

`FMaterialShader` 可以有多个实例，并提供了一个设置着色器参数的接口，实现了 Shader 的 C++ 代码修改绑定的 HLSL 参数的功能

和 `FGlobalShader` 另一个不同在于，`FMaterialShader` 专门**与材质交互**

`FMaterialShader` 又派生出 `FMeshMaterialShader` 子类，这个子类为所有需要材质和顶点工厂参数的 Shader 提供了相关的接口，允许在绘制之前修改修改 Shader 中的参数

### 将 C++ 绑定到 HLSL

`FShader` 作为 Shader 在 CPU 上的代表，需要借助宏来与 HLSL Code 联系起来。

```cpp
IMPLEMENT_MATERIAL_SHADER_TYPE(TemplatePrefix, ShaderClass, SourceFilename, FunctionName, Frequency)
```

举例说明：

```cpp
IMPLEMENT_MATERIAL_SHADER_TYPE(,FDepthOnlyPS,TEXT(“/Engine/Private/DepthOnlyPixelShader.usf”),TEXT(“Main”),SF_Pixel);
```

- 这里忽略了第一个参数，因为本例比较特殊不是一个模板函数
- 第二个参数：`FDepthOnlyPS` 是 C++ 的 Shader 类
- 第三个参数：要绑定的 HLSL Code 文件
- 第四个参数：表示与这个 HLSL 文件中的哪个函数存在关联
- 第五个参数：这里的“频率”指定着色器的类型（vertex、hull、domain、geometry、pixel or compute）

### 在 Shader 编译之前 Modify

**Shader Permutation：**
- 当我们编辑一个材质时，UE 会自动针对不同用途编译出很多种 Shader 的组合，在大部分情况下会导致产生大量不需要使用的着色器
-  `ShouldCache()` 用来返回一个 Shader 是否需要被编译的结果，只有当**Shader、Material 和 VertexFactory**都返回 true 的时候才会创建着色器的特定排列（permutation）

**HLSL preprocessor defines**：
- 可以在 HLSLCode 编译之前修改内部的预处理器定义
- `FShader::ModifyCompilationEnvironment()`，`FMaterial::SetupMaterialEnvironment`，`FVertexFactory::ModifyCompilationEnvironment()`
- `FMaterial` 常用该方法优化相关代码

## Shader 的输入数据

Shader 创建完毕，接下来要考虑如何将数据传递到 GPU 上进行渲染

### FVertexFactory

顶点工厂将**顶点数据源进行封装**并**链接到一个顶点着色器**上。

最常用的两个顶点工厂：
- `FLocalVertexFactory`：将显式顶点属性从局部空间转换到世界空间
- `FGPUBaseSkinVertexFactory`：和 SkeletalMeshes 相关，需要更多数据

### FPrimitiveSceneProxy

那么这些顶点数据如何得到？

渲染线程需要从游戏线程获取渲染资源的数据，方式是通过游戏线程中 `FPrimitiveComponent` 在渲染线程中的代理 `FPrimitiveSceneProxy`

设置代理目的是将两个线程要操作的数据解耦，除了一些特定的同步手段外，两个线程互相不去使用对方线程的数据资源。

### 将 C++ 绑定到 HLSL

综上， `FPrimitiveSceneProxy` 从游戏线程中获取渲染资源，再通过 `FVertexFactory` 封装顶点数据并与顶点着色器链接

在 BasePass 中，只有一个顶点函数负责接收数据，这意味着这个函数需要适配所有不同的输入数据，同样是利用宏实现：

```cpp
IMPLEMENT_VERTEX_FACTORY_TYPE(FactoryClass, ShaderFilename, bUsedWithmaterials, bSupportsStaticLighting, bSupportsDynamicLighting, bPrecisePrevWorldPos, bSupportsPositionOnly)
```

举例：
```cpp
IMPLEMENT_VERTEX_FACTORY_TYPE(FLocalVertexFactory,”/Engine/Private/LocalVertexFactory.ush”,true,true,true,true,true);
```

在不同的顶点工厂内部，都有定义一套专门的数据结构用来描述输入的顶点数据，UE 会根据上提供的 `.ush` 头文件来判断使用哪种数据结构

举例：

```cpp
void Main(FVertexFactoryInput Input, out FBasePassVSOutput Output)
{ 
	// ...
}
```

这个是一个 VertexShader 的入口函数，接收一个顶点工厂输入，这个输入在不同的顶点工厂内部有不同的结构形式定义：

```cpp
// LocalVertexFactory.ush
struct FVertexFactoryInput
{
	float4 Position : ATTRIBUTE0;
	float3 TangentX : ATTRIBUTE1;
	float4 TangentZ : ATTRIBUTE2;
	float4 Color : ATTRIBUTE3;
	// ...
};

// GpuSkinVertexFactory.ush
struct FVertexFactoryInput
{
	float4 Position : ATTRIBUTE0;
	half3 TangentX : ATTRIBUTE1;
	half4 TangentZ : ATTRIBUTE2;
	uint4 BlendIndices : ATTRIBUTE3;  
	uint4 BlendIndicesExtra : ATTRIBUTE14;  
	// etc…
};
```

## 参考链接
- [Unreal Engine 4 Rendering Part 2: Shaders and Vertex Data | by Matt Hoffman | Medium](https://medium.com/@lordned/unreal-engine-4-rendering-part-2-shaders-and-vertex-data-80317e1ae5f3)


---

