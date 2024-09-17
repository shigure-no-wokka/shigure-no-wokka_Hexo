---
title: Cpp 模板：类内对于模板类名的简化
date: 2024-04-26 20:13:29
description: C++ 模板学习
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_code.jpg
categories: Code
tags:
  - 模板
  - Cpp
---

# 类内对于模板类名的简化

假如有如下代码：

```cpp
template<typename T>
class TestClass
{
public:
    TestClass& operator=(const TestClass& Other) { return TestClass(); } // 直接使用了模板类名
};
```

在类模板内部，没有具体指定`TestClass`的具体模板实参，此时会默认使用当前模板类自己的模板实参。

**因为这里在类模板自己的作用域内**

如果像这样，

```cpp
template<typename T>
class TestClass
{
public:
    TestClass<int>& operator=(const TestClass<int>& Other) { return TestClass<int>(); } // 直接使用了模板类名
};
```

则是指定了这里参与的是一个以`int`作为模板实参实例化的类

也因此，[# 类模板的成员函数]在这里提到过，类外定义模板类的成员函数需要显式指明`template`并传给模板类名，就是**类外定义处于模板类的作用域之外，因此需要显式指定**

```cpp
template<typename T>
void TestClass<T>::TestFunction(T)
{// 直到上边 TestClass<T>才表示进入了类的作用域
    TestClass test_class; // 所以这里可以不加
    // 因为函数体内部已经属于类的作用域内了
}
```
