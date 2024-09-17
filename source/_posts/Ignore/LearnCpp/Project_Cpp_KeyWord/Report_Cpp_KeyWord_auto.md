---
title: Cpp 关键字：auto
date: 2024-04-20 19:49:09
description: C++ 关键字
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_code.jpg
categories: Code
tags:
  - Cpp
  - 关键字
---

C++ 11 里可以使用 `auto` 关键字来自动类型推导

# 推导原则

1. 赋值运算符右边表达式是一个引用类型时，会舍弃引用，只返回原始类型
2. 表达式类型不是指针或引用，会将 cv（const，volatile）限定符抛弃
3. 表达式类型是指针或引用，会保留 cv

```cpp
// 推导原则 1
	int temp;
	int& a = temp;
	auto b = a; // b 是一个 int

// 推导原则 2
	const int temp;
	auto a = temp;
// 推导原则 3
	volatile int *temp;
	auto a = temp; // a 是一个 volatile int*

    volatile int temp;
	auto a = temp; // a 是一个 int
```

# 使用限制

- **不能在函数参数中使用**：auto 要求变量初始化，而函数形参只是声明没有赋值
- **不能用于类的非静态成员变量**：类的非静态成员变量初始化在构造函数中进行，而不是定义中，所以不允许在类的定义中使用
- **不能定义数组**
- **不能用于模板参数**

