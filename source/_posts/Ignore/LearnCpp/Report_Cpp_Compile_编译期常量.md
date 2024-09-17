---
title: Cpp 编译：编译期常量
date: 2024-04-26 20:18:41
description: C++ 编译期
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_code.jpg
categories: Code
tags:
  - 编译期
  - Cpp
---

看一个简单例子：
```cpp
#include <iostream>
int main()
{
	int x = 10;
	constexpr int y = x; // 编译错误：expression must have constant value
	return 0;
}
```

在上边的例子中，定义了一个变量 x 并初始化，又定义了一个变量 y，它是一个编译期常量，但给它赋值的变量 x 是一个运行时常量，因而出现编译错误

修改后：
```cpp
int main()
{
	const int x = 10;
	constexpr int y = x;
	return 0;
}
```
此时编译正确，const 修饰的变量在初始化后就不能修改，可以是一个编译期常量，也可以是一个运行时常量，由于 x 是在编译期被赋值的，所以可以用来 constexpr 的变量 y 的初始化表达式

如果稍微修改一下，去掉给 x 的赋值：
```cpp
int main()
{
	const int x; // 编译错误：const variable "x" requires an initializer
	constexpr int y = x; // 编译器错误：expression must have a constant value
	return 0;
}
```



