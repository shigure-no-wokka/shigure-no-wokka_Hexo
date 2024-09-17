---
title: Cpp 关键字：const
date: 2024-04-20 19:50:22
description: C++ 关键字
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_code.jpg
categories: Code
tags:
  - 关键字
  - Cpp
---


# 函数参数声明为`const`，保证函数适用于不能拷贝的类型，避免了费事的拷贝过程

```cpp
template<typename T>
int Compare(T& x, T& y);
```

`Compare()`接收两个类型`T`对象的引用，避免了传参过程中的拷贝


# 顶层 const 和底层 const

- 顶层：指针本身是一个常量

```cpp
const int x = 5; // 顶层 const
const int *ptr = &x; // ptr 是底层 const，指向一个 const int
*ptr = 10; // 错误
```

- 底层：指针指向对象是一个常量

```cpp
int x = 5;
int* const ptr = &x; // 顶层 const
*ptr = 10; // 正确，x 非 const，可以修改
```


