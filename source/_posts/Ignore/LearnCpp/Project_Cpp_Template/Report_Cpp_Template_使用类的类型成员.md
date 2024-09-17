---
title: C++ 模板：使用类的类型成员
date: 2024-04-26 20:06:34
description: C++ 模板学习
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_code.jpg
categories: Code
tags:
  - 模板
  - Cpp
---

在非模板代码中，我们可以这么写

```cpp
string::size_type
```

编译器有 `string` 的定义，因此会知道 `size_type` 是表示一个类型，而不是 `static` 数据成员

但是对于模板代码中，`T::size_type` 会产生歧义。由于编译器会默认**通过作用域运算符访问的名字不是类型**，形如：

```cpp
T::size_type * p;
```

会被认定成变量 `p` 和类型 `T` 中的静态成员 `size_type` 的乘积，然而程序员可能想表达的是，使用 `T` 中的类型成员 `size_type` 声明一个指针 `p`

为了避免这种歧义，就需要**显式指明这个名字是一个类型**

```cpp
typename T::size_type *p;
```

使用如下：

```cpp
template<typename T>
typename T::value_type TestFunction(const T& C)
{
    return typename T::value_type();
}
```

上边代码中，实现了一个模板函数，返回了一个默认初始化的 `T::value_type` 类型的变量


综上，**如果期望通知编译器一个名字表示一个类型时，就必须使用关键字 `typename`**
