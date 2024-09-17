---
title: Cpp 数据类型：POD
date: 2024-04-01 20:20:24
description: C++ 数据类型
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_code.jpg
categories: Code
tags:
  - 数据类型
  - Cpp
---

# POD 类型

- 简单理解：可以直接进行 memcpy 的数据类型，像 int、float、double

C++ 中出现了继承、派生的概念，而 C 语言中则没有，为了和旧的 C 数据兼容，在 C++ 中就提出了 POD 的概念。

POD，Plain Old Data，具有两个性质：平凡（trival）和标准布局（standard layout）

判断是否为 POD 类型：
```cpp
template<typename T> struct std::is_pod;
```

## 平凡性

平凡性的类或结构体需要满足四点特征：
1. 平凡的**默认构造函数**
2. 平凡的**默认拷贝构造**和**移动构造函数**
3. 平凡的**拷贝赋值运算符**和**移动赋值运算符**
4. 不能包含**虚函数**和**虚基类**


可以使用如下类模板来判断一个类是否平凡：
```cpp
template<typename T>struct std::is_trivial;

class Base
{
public:
	int a;
	int b;
};

void test_Func()
{
	std::cout << std::is_trivial<Base>::value << std::endl;
}
// >> 1
```

## 标准布局

判断方法：
```cpp
template<typename T> std::is_standard_layout; // #inlcude <type_traits>
```

同样满足下面条件的类或结构体，是标准布局的
1. 所有**非静态成员**的访问权限相同（同为 private、public 或 protected）
2. 类或结构体的继承中，满足条件之一（**继承树中最多只能有一个类有非静态数据成员**）
	- 派生类有非静态成员，且只有仅包含静态成员的基类
	- 基类有非静态成员，派生类没有非静态成员
3. 类中第一个非静态数据成员的类型与基类不同（**基于 C++ 中，优化不包含成员的基类产生的**）
```cpp
class B1 {};
class B2 {};
class D1 : public B1
{
B1 b;
int i;
};
class D2 : public B1
{
B2 b;
int i;
};

void test_func()
{
	std::cout << std::is_trivial<D1>::value << std::endl; // >> 0
	std::cout << std::is_trivial<D2>::value << std::endl; // >> 1
}
```

原因：如果基类没有数据成员，基类不占用空间，C++ 会允许派生类的第一个成员和基类共享地址空间。但是如果派生类的第一个非静态成员类型和基类相同，**C++ 会要求相同类型的对象的地址必须不相同**，从而使得编译器给基类额外分配一个字节的地址空间。具体的内存布局如下图：

![[Pasted image 20240331181108.png]]
4. 没有虚函数和虚基类
5. 派生类所有非静态成员符合标准布局类型，其父类也符合。

## POD 类型的好处

1. 字节赋值。可以使用 memset 和 memcpy 对 POD 类型初始化和拷贝
2. 和 C 内存的兼容。POD 类型的数据在 C 与 C++ 之间的操作总是安全的
3. 保证静态初始化的安全有效。POD 类型的对象初始化往往更简单

对于第三点，具体来说：
1. 简单：POD 类型对象可以简单**使用=来静态初始化**，不需要调用构造函数
2. 安全：**POD 类型使用静态初始化是安全的**，不会导致未定义行为
3. 有效：**静态初始化可以在编译时完成，不需要运行时额外的初始化操作**，提高效率。


