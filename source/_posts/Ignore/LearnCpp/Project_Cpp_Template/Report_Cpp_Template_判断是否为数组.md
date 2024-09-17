---
title: C++ 模板：判断是否为数组
date: 2024-04-26 20:07:36
description: C++ 模板学习
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_code.jpg
categories: Code
tags:
  - 模板
  - Cpp
---

假如：
```cpp
class A;
typedef A ArrayA[3];
ArrayA* ptr;

template<typename T>
...
```

此时，ptr 是一个指针，指向一个大小为 3 的类型 A 的数组。

如果还有一个模板，它接收一个类型 T 的指针，将这个 ptr 指针传入，可能会引发意料外的错误。

**因为这个 ptr 是一个数组的指针，而不是指向数组开头第一个元素的指针，很可能因为模板内部逻辑不同而导致出现内存访问问题。**

那么，如何利用模板元编程来判断一个类型是否为数组呢？

```cpp
// 接收一个类型 T，输出判断 value
tempalte<typename T>
struct TIsArray 
{
	enum{
		value = false
	};
};
// 设置特化版本，接收有准备大小的数组类型
template<typename T, int ArraySize>
struct TIsArray<T[ArraySize]>
{
	enum{
		value = true
	};
};
// 另一个特化版本，接收没有指明大小的数组类型
template<typename T>
struct TIsArray<T[]>
{
	enum{
		value = true;
	};
};

// 测试用
constexpr bool test = TIsArray<int[]>::value; // test = 1
```

在上边的代码中，根据需要，建立了一个模板类，并使用 enum 类型的 value 变量输出判断。要判断是否为数组，需要和 `T[N]` 或者 `T[]` 进行匹配，即另外特化两个模板。

对于 C++ 中的实现如下：
```cpp
template<class T>
constexpr bool is_array_v = false;
template<class T, int N>
constexpr bool is_array_v<T[N]> = true;
template<class T>
constexpr bool is_array_v<T[]> = true;

// 测试用
constexpr bool test2 = is_array_v<int[9]>;
```

在 C++ 的实现版本中，直接设置了一个模板常量表达式 is_array_v，不需要之前实现的那种版本再取 value 这个步骤，对于具体的模板匹配上和之前的类似。

这里可以再提一句有意思的：
```cpp
class TestA;
typedef TestA ArrayOfTestA[3];
// 问下边的结果？
constexpr bool test3 = is_array_v<ArrayOfTestA>;
```

结果是 true。ArrayOfTestA 是一个类型别名，他表示一个大小为 3 的 TsetA 类型的数组，传入 is_array_v 进行类型匹配时编译期会将类型别名进行展开，也就是最后使用 `TestA[3]` 进行匹配


