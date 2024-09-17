---
title: UE 基础：智能指针
date: 2024-05-12 08:24
description: 
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_engine.jpg
categories: 软件知识
tags:
  - UE
---

# 概述

TSharedPtr 是 UE 实现的一套智能指针，和 C++ 中的智能指针类似。

目的是方便开发人员管理内存（无全局 GC 的），并且智能指针只能用于 C++ 对象

UE 中的智能指针可以分为两大类：

**1 持有非 UObject 对象的智能指针**

不能使用 UPROPERTY

TSharedPtr，TSharedRef，TWeakPtr，TSharedFromThis，TUniquePtr，TUniqueObj，TPimplPtr，TNonNullPtr，TOptional

**2 持有 UObject 的智能指针**

因为 UObject 对象要参与 GC，而 SharedPtr 自身管理一套引用计数，二者不能混用

TStrongObjectPtr，TWeakObjectPtr，FSoftObjectPtr，TSoftObjectPtr，TSoftClassPtr，FSoftObjectPath，FLazyObjectPtr，TPersistentObjectPtr，FGCObject，FGCObjectScopeGuard，TGCObjectsScopeGuard，TWeakInterfacePtr

在 UE 中，对于 UObject 对象可以被 UE 自己的 GC 管理（使用 UPROPERTY 修饰或者手动添加到 GC 中），而对于 RawPtr 则需要使用 TSharedPtr 管理


# TObjectPtr/FObjectPtr

因为 UE 5 放弃了 32 位系统而专注 64 位系统上的开发，并且当前的寻址空间不可能将 64 位全部用完，所以为了额外存储一些信息，UE 对 RawPtr 进行了封装，`TObjectPtr` 就包含了这些额外的信息，方便进行动态解析、Debug 追踪等等。

TObjectPtr 并不等同于 RawPtr，但使用上和 RawPtr 无异，只是通过相关宏：信息封装和动态解析 `UE_WITH_OBJECT_HANDLE_LATE_RESOLVE`、Debug 追踪 `UE_WITH_OBJECT_HANDLE_TRACKING`，而定义的 `WITH_EDITORONLY_DATA` 在编辑器下启用。在非编辑器下，TObjectPtr 会自动还原为 RawPtr，以减少性能开销。

```cpp
UPROPERTY()
TObjectPtr<UActorComponent> ActorCompPtr;
```


# TWeakObjectPtr

如名，表示对 UObject 的弱引用，和 TWeakPtr 的概念类似，只是作用的对象不同

```cpp
UObject* RawPtr;
TWeakObjectPtr<UObject> WeakPtr;
```

当 RawPtr 被回收后，RawPtr 已经无法使用。而 WeakPtr 虽然无法阻止对象被 GC 回收，但 Weakptr 可以通过 IsValid 来判断对象是否还存在

- 和 TWeakPtr 的区别在于：TWeakObjectPtr 是针对 UObject 的智能指针，而 TWeakPtr 则是针对非 UObject 的智能指针




# 参考链接
-  [TObjectPtr | Unreal Engine 5.2 Documentazione | Epic Developer Community](https://dev.epicgames.com/documentation/it-it/unreal-engine/API/Runtime/Core/Delegates/TObjectPtr%3Fapplication_version%3D5.2%3Fapplication_version%3D5.2%3Fapplication_version%3D5.2?application_version=5.2)
- [简析 UE5 的对象指针 FObjectPtr 与 TObjectPtr - 知乎](https://zhuanlan.zhihu.com/p/504115127)
- [WTF is TObjectPtr in Unreal Engine 5 - YouTube](https://www.youtube.com/watch?v=uv8hyf3AB-I)
- [Should you be using TObjectPtr\<\> instead of raw pointers? : r/unrealengine](https://www.reddit.com/r/unrealengine/comments/15dp3dd/should_you_be_using_tobjectptr_instead_of_raw/)
- [TWeakObjectPtr | Unreal Engine Documentation](https://docs.unrealengine.com/4.26/en-US/API/Runtime/Core/UObject/TWeakObjectPtr/)
- [UE4 TSharedPtr, TWeakObjectPtr and TUniquePtr - Bill Yuan - 博客园](https://www.cnblogs.com/sevenyuan/p/11850750.html)
- [关于 UE4 对象静态/动态的销毁问题整理 (AddToRoot、TWeakObjectPtr) - HONT - 博客园](https://www.cnblogs.com/hont/p/16255652.html)
- [UE4 的智能指针 TSharedPtr - 知乎](https://zhuanlan.zhihu.com/p/369974105)
- [UE5 智能指针 - 知乎](https://zhuanlan.zhihu.com/p/688462036)
- [UE4 中的智能指针 | Stone の BLOG](https://stonelzp.github.io/UE4%E4%B8%AD%E7%9A%84%E6%99%BA%E8%83%BD%E6%8C%87%E9%92%88/)