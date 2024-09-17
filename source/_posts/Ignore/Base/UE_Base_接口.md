---
title: UE 基础：接口
date: 2024-05-02 09:37:44
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_engine.jpg
categories: 软件知识
tags:
  - UE
---

# 分析

接口的实现形式：

```cpp
UINTERFACE()
class UTestInterface : public UInterface
{
    GENERATED_BODY()
};

class ITestInterface
{
    GENERATED_BODY()
public:
    UFUNCTION(BlueprintImplementableEvent)
    void TestInterfaceFunction1();
    UFUNCTION(BlueprintImplementableEvent)
    void TestInterfaceFunction2();
};
```

创建接口 C++ 类后会出上如上所示两种，`UTestInterface`和`ITestInterface`
- 前者是用于反射系统识别的，后者才是真正要声明接口函数时的位置
- 在 C++ 中，使用`ITestInterface`。蓝图中，二者其实是同一个接口，名为`TestInterface`


**思考：为什么要有两个形式？**

当我们给一个类连入接口时为如下形式：

```cpp
UCLASS()
class ATestCharacter : public ACharacter, public ITestInterface
{
    GENERATED_BODY()
public:
    //...
};
```

这里涉及到虚继承（见Code中的整理笔记）的知识，但 UE 并没有实现对虚继承做支持，而是做出保证，比如一个继承自`UObject`的派生类对象，其地址和其转型为`UObject`后的地址是一致的，也就是 **`UObject`需要在继承链的第一个位置**

而`UTestInterface`目的就是告诉反射系统，存在这样的一个接口，从而通过某些方式找到这个实际的接口类


# 接口实现

利用标签`BlueprintImplementableEvent`表明在蓝图中实现接口方法（**不能声明为 virtual**）：

```cpp
UCLASS()
class ATestCharacter : public ACharacter, public ITestInterface
{
    GENERATED_BODY()
public:
    UFUNCTION(BlueprintImplementableEvent, BlueprintCallable)
    void TestInterfaceFunction1();
    UFUNCTION(BlueprintImplementableEvent, BlueprintCallable)
    void TestInterfaceFunction2();
};
```


如果想在 C++ 和蓝图都可以重写，

```cpp
UCLASS()
class ATestCharacter : public ACharacter, public ITestInterface
{
    GENERATED_BODY()
public:
    UFUNCTION(BlueprintNativeEvent)
    void TestInterfaceFunction();

    // 这里可以用 virtual 实现在 C++ 中的重写
    virtual void TestInterfaceFunction_ImplementableEvent() = 0;
};
```


# 参考

- [官方文档：接口](https://docs.unrealengine.com/4.26/zh-CN/ProgrammingAndScripting/GameplayArchitecture/Interfaces/)
