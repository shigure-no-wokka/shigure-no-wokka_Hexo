---
title: C++ 模板：全特化和偏特化
date: 2024-04-26 20:07:06
description: C++ 模板学习
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_code.jpg
categories: Code
tags:
  - 模板
  - Cpp
---

利用模板，使得 C++ 对于类型的要求更为宽松，使得不同类型的同种逻辑操作可以封装在同一个模板内，提高复用性。

# 函数模板




# 类模板



**和函数模板不同，编译器无法为类模板推断模板参数类型，必须要显式在模板名后的尖括号里提供信息，编译器再利用这些模板实参实例化特定的类**

```cpp
// 类模板
template<class T1, class T2>
class TestClassTemplate
{
public:
	void Equal(T1, T2);
};

template<class T1, class T2>
void TestClassTemplate<T1, T2>::Equal(T1, T2) {}
```

## 类模板：全特化

之前的模板适用于一切定义了`==`操作的类型，有可能存在某些特殊类型或自定 i 有类型不支持通用模板重的操作，或者像用不同的逻辑实现，这时候就需要针对性定义一下

```cpp
// 类模板：全特化
template<>
class TestClassTemplate<int, int>
{
public:
	void Equal(int, int);
};

void TestClassTemplate<int, int>::Equal(int, int){}
```

## 类模板：偏特化

全特化中将所有的模板参数限定为特定类型，也可以只限定部分模板参数

比如这里想实现对两种不同类型的`Compare::Equal(T1, T2);`

```cpp
// 类模板：偏特化
template<class T>
class TestClassTemplate<int, T>
{
public:
	void Equal(int, T);
};

template<typename T>
void TestClassTemplate<int, T>::Equal(int, T) {}
```




