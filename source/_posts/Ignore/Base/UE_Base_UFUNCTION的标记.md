---
title: UE 宏：UFUNCTION()
date: 2024-05-02 10:47:54
description: 
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_engine.jpg
categories: 软件知识
tags:
  - UE
---

# BlueprintCallable

```cpp
UFUNCTION(BlueprintCallable)
float TestFunction01() const;
```

通过调用`DECLARE_FUNCTION(execTestFunction01)`宏，生成一个名为`execTestFunction01`的函数

具体实现：

```cpp
DEFINE_FUNCTION(ATestCharacter::execTetsFunction01)
{
    // 参数处理部分这里略
    P_FINISH; // 取参之后的操作
    P_NATIVE_BEGIN;
    *(float*)Z_Param_Result = ATestCharacter::TestFunction01(); // 最终还会调用到自己实现的函数版本
    P_NATIVE_END;
}
```

也就是说，一个**普通版本的函数**被蓝图调用，实际上调用的是一个以`exec`开头的代理函数，在这个代理函数内才真正调用类中的对应函数


# BlueprintNativeEvent

```cpp
UFUNCTION(BlueprintNativeEvent)
float TestFunction02();
```

当在 C++ 中创建实现的时候是以`TestFunction02_Implementation()`实现的，而函数名为`TestFunction02()`的函数实现则会被 UBT 和 UHT 生成的代码中实现，而这个版本实现目的是**从实现的反射列表中，根据我们这个函数名 `TEXT("TestFunction02")` 去寻找`exec`版本的实现（会有一个注册表，记录着函数名和具体函数地址的映射）**，这里的`exec`版本实现就会调用`_Implementation`版本，也即 C++ 中的实现。

如果在蓝图中重写了这个函数，那么就会把这里这个注册表中的映射地址修改为蓝图的版本，从而调用蓝图版本的实现


# BlueprintImplementableEvent




# CustomThunkFunction

之前提到，给一个函数标记为 UFUNCTION 时，UHT 会自动生成一个对应的`execFunction`，但我们可以在宏中标记`CustomThunk`，阻止 UHT 生成，而是自己提供实现

```cpp
UFUNCTION(BlueprintCallable, CustomThunk)
int32 GetHp() const;
// 实现方式其实就是手动把 UHT 自动生成的版本格式拿来修改修改
// 由于这里标记了 CustomThunk 所以 UHT 不会生成
DECLARE_FUNCTION(execGetHp)
{
    P_FINISH;
    P_NATIVE_BEGIN;
    *(int32*)Z_Param__Result = P_THIS->GetHp();
    P_NATIVE_END;
}
```

对于通配符的实现，可以看这个[手动将属性添加到 GC](../UE课程/10：手动将属性添加到GC.md)


