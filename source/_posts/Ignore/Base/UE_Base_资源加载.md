---
title: UE 基础：资源加载
date: 2024-05-12 11:51
description: 
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_engine.jpg
categories: 软件知识
tags:
  - UE
---

- 资源引用
	- 硬引用
		- 硬指针
		- `static ConstructorHelpers::FClassFinder<>`
		- `static ConstructorHelpers::FObjectFinder<>`
	- 软引用
		- `FSoftObjectPaths`、`FStringAssetReference`
		- `TSoftObjectPtr<T>`
- 资源加载：
	- 同步加载
		- `LoadClass` 、`LoadObject `
		- `TryLoad/LoadSynchronous`
	- 异步加载
		- `FStreamableManager.RequestAsyncLoad()`
- 资源卸载

# 资源引用

`ConstructHelpers` 的两种方法为**静态加载/硬加载**
- 要加上 `static`（保证只有一份资源实例） 
- 必须要在**构造函数**中使用
- `FObjectFinder` 是对 LoadObject 的封装
- `FClassFinder` 内部调用 LoadObject

## 硬引用

**硬引用**：对象 A 引用对象 B。A 加载时，B 也被加载

- 硬指针：在 UPROPERTY 修饰的属性中设置（一般会在蓝图上设置）
```cpp
UPROPERTY(EditDefaultOnly)
UStaticMesh* MeshData;
```

- 构造函数中： `FClassFinder` 和 `FObjectFinder`
	- `FClassFinder` 一般用来加载蓝图资源，原因是：如果需要用蓝图来创建 C++ 对象，必须获取蓝图的 Class，再通过 Class 生成蓝图对象
	- `FObjectFinder` 一般加载非蓝图资源

```cpp
static ConstructorHelpers::FClassFinder<AActor> BP_MyActor(TEXT("Blueprint'/Game/BP_MyActor.BP_MyActor_C'"));

static ConstructorHelpers::FObjectFinder<UClass> StaticMesh(TEXT("StaticMesh'/Game/StaticMesh.StaticMesh'"));
```

如果资产不存在或者出错，则该属性被置为 nullptr，再重审一遍：
- **`ContructorHelpers` 只能在构造函数中使用，非构造函数中会引起 Crash，其代码内部会通过 `CheckIfIsInConstructor(ObjectToFind)` 检测是否在构造函数内调用**
- `ConstructorHelpers` 前必须要加上 `static`

蓝图资源问题：
- 地址问题
	- 在 BP 路径后加_C：如上例地址：**Blueprint'/Game/MyActorBP. MyActorBP_C'**
	- 去掉路径前缀、单引号，后缀，只保留路径：如上例地址改为：**/Game/MyActorBP. MyActorBP**
	- 非蓝图资源的地址可以直接输入，不需要修改
- `FClassFinder` 的模板名要选择创建蓝图的父类名，不能写 `UBlueprint`


## 软引用

**软引用**：对象 A 通过间接机制（字符串形式的对象路径）引用 B

**FSoftObjectPath**：一个结构体，其中包含了资源的完整名称（字符串），从而可以随时找到硬盘上目标资源并加载进内存
- `FSoftObjectPath.SolveObject()` 检查是否被加载
- `FSoftObjectPath.IsPending()` 检查是否准备好

**FStringAssetReference**：FSoftObjectPath 的别名

```cpp
typedef FSoftObjectPath FStringAssetReference;
```

**TSoftObjectPtr**：包含了 FSoftObjectPath 的 TWeakObjectPtr
- `TSoftObjectPtr.Get()` 检查是否载入内存
- `ToSoftObjectPath()` 得到 FSoftObjectPath 来加载资源

---
# 资源加载

## 同步加载

- `LoadObject<T>`：加载非蓝图资源
- `LoadClass<T>`：加载蓝图资源，并获取蓝图 Class，内部实现是调用 LoadObject 并获取类型。

```cpp
TSubclassOf<AActor> BPClass = LoadClass<AActor>(nullptr, TEXT("/Game/Blueprints/MyBP"));
```

## 异步加载




---
# 资源卸载



---

# 参考链接
- [【UE4】加载资源的方式（三）使用 ConstructorHelpers 来加载 - 多思考多实践同等重要 - 博客园](https://www.cnblogs.com/sin998/p/15505912.html)
- [UE4 C++ 静态加载问题：ConstructorHelpers::FClassFinder() 和 FObjectFinder()-CSDN 博客](https://blog.csdn.net/SUKHOI27SMK/article/details/101058135)
-  [Aery 的 UE4 C++ 游戏开发之旅（4）加载资源&创建对象 - KillerAery - 博客园](https://www.cnblogs.com/KillerAery/p/12031057.html)
-  [FClassFinder | Unreal Engine Documentation](https://docs.unrealengine.com/4.27/en-US/API/Runtime/CoreUObject/UObject/ConstructorHelpers/FClassFinder/)
---
