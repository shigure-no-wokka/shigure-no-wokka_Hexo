---
title: Cpp 模板：类模板
date: 2024-04-26 20:13:55
description: C++ 模板学习
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_code.jpg
categories: Code
tags:
  - 模板
  - Cpp
---

# 在模板作用域中引用模板类型

类模板的名字不是一个类型名，它被用来实例化具体的类型

# 类模板的成员函数

类模板的成员函数就是普通的成员函数，但是对于实例化的类模板，其内部都有特定类型的成员函数。所以，**类模板的成员函数具有和模板相同的模板参数**

在类外定义，也就需要显式以`template`关键字开始以接收模板实参，并在类模板名后以`<>`接收类模板实参

```cpp
template<typename T>
void TestClass<T>::TestFunction(T){}
```

# 类模板成员函数的实例化

对于一个类模板，只有在使用到的时候编译器才会对其进行实例化，类模板的成员函数也是一样。

**（默认）如果这个成员函数没有被使用，那么就不会进行实例化**







