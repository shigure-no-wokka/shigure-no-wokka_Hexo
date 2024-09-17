---
title: UE 基础：对象创建
date: 2024-05-12 11:10
description: 
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_engine.jpg
categories: 软件知识
tags:
  - UE
---

# 纯 C++ 类的创建和销毁

- **创建**：推荐使用智能指针[UE 基础：智能指针](UE基础：智能指针.md)
- **销毁**：智能指针通过引用计数自动管理与销毁



# UObject

`NewObject()` 用来创建 UObject 对象
- Outer 表示该类的外部对象，可以传入创建该对象的类的 this

```cpp
template<class T>
T* NewObject(UObject* Outer)
{
	T* Object = ::NewObject<T>(Outer);
	Object->SetInternalFlags(EInternalObjectFlags::Async);
	return Object;
}

template<class T>
T* NewObject(UObject* Outer, UClass* Class, FName Name = NAME_None, 
EObjectFlags Flags = RF_NoFlags, UObject* Template = nullptr,
bool bCopyTransientsFromClassDefaults = false, FObjectInstancingGraph* InInstanceGraph = nullptr)
{
	T* Object = ::NewObject<T>(Outer, Class, Name, Flags, Template, bCopyTransientsFromClassDefaults, InInstanceGraph);
	Object->SetInternalFlags(EInternalObjectFlags::Async);
	return Object;
}

```

创建实例如下：
```cpp
UItemObject* Obj = NewObject<UItemObject>();
UItemObject* Obj2 = NewObject<UItemObject>(this, TEXT("Obj2"));
```

**自动回收**：
- UObject 及派生类被 GC 管理，当指向对象的指针为 nullptr，即没有该对象的任何引用后就会被 UE 自动回收
```cpp
Obj = NewObject<UItemObject>(this, TEXT("Obj"));
Obj = nullptr;
```

**主动回收**：
- `UObject::ConditionalBeginDestroy()`
	- 异步执行且对象在当前帧持续有效
	- GC 发生在下一帧

```cpp
Obj->ConditionalBeginDestroy();
Obj = nullptr;
```

- `MarkPendingKill()`
	- 标记：`PendingKill`。指向实例的指针被置为 nullptr，在下一次 GC 时删除
	- `IsPendingKill` 判断是否处于该状态
	- `ClearPendingKill` 清除该状态

```cpp
Obj->MarkPendingKill();
Obj = nullptr;
```

可以在 `Engine\Config \BaseEngine.ini` 修改参数，变更销毁时间间隔

```cpp
gc.TimeBetweenPurgingPendingKillObjects=60
```

**强制垃圾回收**：
- `GEngine->ForceGarbageCollection`

```cpp
GEngine->ForceGarbageCollection(true);
```


---
# AActor

通过 `UWorld::SpawnActor()` 创建继承自 AActor 的类
- [生成 Actors | 虚幻引擎 4.27 文档](https://docs.unrealengine.com/4.27/zh-CN/ProgrammingAndScripting/ProgrammingWithCPP/UnrealArchitecture/Actors/Spawning/)

```cpp
AActorClass* MyClass = GetWorld()->SpawnActor<AActorClass>(NewLocation, NewRotation);
```

可以通过 `AActor::Destroy()` 方法销毁
- [AActor::Destroy | Unreal Engine Documentation](https://docs.unrealengine.com/4.27/en-US/API/Runtime/Engine/GameFramework/AActor/Destroy/)


---
# UActorComponent

通过 `CreateDefaultSubobject()` 创建（只能在构造器中使用）

```cpp
UMySceneComponent* MySceneComponent = CreateDefaultSubobject<UMySceneComponent>(TEXT("MySceneComponent"));
```

也可以使用 NewObject 创建，但需要额外进行 `RegisterComponent` 或 `RegisterAllComponents` 将其注册：

```cpp
UStaticMeshComponent* MyMeshComp = NewObject<UStaticMeshComponent>(this, TEXT("MyMeshComp"));
MyMeshComp->SetupAttachment(RootComponent);
MyMeshComp->SetRelativeLocation(FVector(0.f, 0.f, 0.f));
MyMeshComp->RegisterComponent();
//RegisterAllComponents();
```

销毁则使用 `UActorComponent::DestroyComponent()`
-  [UActorComponent::DestroyComponent | Unreal Engine Documentation](https://docs.unrealengine.com/4.26/en-US/API/Runtime/Engine/Components/UActorComponent/DestroyComponent/)

# 参考链接
- [【UE4 基础】对象创建与资源获取 - 知乎](https://zhuanlan.zhihu.com/p/99327373)
- [【UE4 C++】UObject 创建、销毁、内存管理 - 砥才人 - 博客园](https://www.cnblogs.com/shiroe/p/14731501.html)


---
