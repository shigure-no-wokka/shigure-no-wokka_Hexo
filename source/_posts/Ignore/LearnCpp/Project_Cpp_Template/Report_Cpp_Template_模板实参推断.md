---
title: Cpp 模板：模板实参推断
date: 2024-04-26 20:11:26
description: C++ 模板学习
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_code.jpg
categories: Code
tags:
  - 模板
  - Cpp
---

# 模板类型转换

函数模板的实参可以被用来初始化函数的形参，并且如果这个函数的形参类型使用了模板类型参数，根据特殊的初始化规则，同样会初始化模板类型参数

只有两种转换可以：
- **const 转换**：非 const 对象的引用或指针传递给一个 const 的引用或指针形参
- **数组或函数指针的转换**：如果形参不是引用类型，会对数组或函数类型的实参进行指针转换，前者为指向首元素的指针，后者为对应函数类型的指针

其他转换：
- 算术转换
- 派生类到基类的转换
- 用户定义的转换
都不能应用于函数模板

```cpp
template <typename T> T fobj(T, T) {}
template <typename T> T fref(const T&, const T&) {}


void Test()
{
	std::string s1("a value");
	const std::string s2("another value");
	fobj(s1, s2);
	fref(s1, s2);

	int a[10], b[42];
	fobj(a, b);
	//fref(a, b); // a 类型为 int[10]，b 类型为 int[42]
	using a_type = decltype(a);
	using b_type = decltype(b);
	constexpr bool result = std::is_same_v<a_type, b_type>;
}
```

# 显式指定实参的类型转换

如果模板类型参数已经显式指定，也可以像普通函数一样进行类型转换

```cpp
template<typename T>
void TestClassFunction(T in_class) {}

class A {};
class B : public A {};

void Test()
{
    A a;
    B b;
    TestClassFunction<A>(a);
    TestClassFunction<A>(b);
}
```

像是使用父类实例化，传入形参是子类同样可以

# 利用显式指定实参的类型转换，传入两个不同的类型

使用方式，标准库的 `max`，接收两个参数返回较大的实参

```cpp
int i = 0, j = 1;
double d = 3.0;
std::max(i, j);
std::max<double>(i, d); // 直接传入 i 和 d 会报错，但是显式指定 double 再传入就可以，因为可以从 int 转换到 double
// 写成 int 也不会报错（只是提一句）
```

# 有的模板要求显式传入模板实参

例如：`std::make_shared`，就要求显式传入实参，因为需要根据传入的模板实参计算需要分配多大的空间


# 尾置返回类型的类型转换

假如有如下模板：

```cpp
template<typename _Iterator>
??? &fcn(_Iterator beg, _Iterator end)
{
    return *beg;
}
```

我们希望让这个函数接收容器的一对迭代器，并返回序列中一个元素的引用

但是这里我们只设置了一个接收迭代器了类型的模板参数，而不知道容器内部元素的具体类型

在调用点的语法为：

```cpp
vector<int> vi{0};
auto ele = fcn(vi.begin(), vi.end());
```

`decltype(*beg)`可以获取到元素对类型，但是在函数调用点`auto &ele = fcn(vi.begin(), vi.end());`所能提供给编译器的信息，只有传入的迭代器类型，在真正开运行进入迭代之前，我们都无法得到这个`*beg`，自然也就无法在编译阶段让编译器得知这个元素的类型

这时就需要用到**尾置返回类型**

```cpp
template<typename _Iterator>
auto fcn(_Iterator beg, _Iterator end) -> decltype(*beg)
{
    return *beg;
}
```

对迭代器解引用后得到一个左值，**再经过`decltype`后推断出是一个元素类型的引用**，最后经过`auto`，会将引用去掉，从而得到元素的类型

参考：[auto 关键字的推导原则](../C++关键字/C++关键字：auto.md)

这里的 `fcn_ret` 实际上是一个 `int` 类型


# 不要返回引用，要返回值

`std::remove_reference`

使用方式：

```cpp
std::remove_reference<int&> // 得到 int
std::remove_reference<string&> // 得到 string

template<typename _Iterator>
auto fcn(_Iterator beg, _Iterator end) -> typename remove_reference<decltype(*beg)>::type
{
    return *beg;
}
```


---
# 函数指针和实参推断

用一个函数模板初始化一个函数指针或给一个函数指针赋值，模板将从指针的类型进行实参推断

```cpp
template<typename T> int compare(const T&, const T&);
int (*pf1) (const T&, const T&) = compare;
```

如上边代码所示，`compare`模板函数会根据`pf1`的指针类型，来推断实参

返回值和形参列表都可以正常推断：

```cpp
template<typename T, typename U, typename M> U compare(const T&, const M&) { return U(); }
int (*pf1)(const int&, const float&) = compare;
```

但是对于重载函数，会出现歧义，无法确定`func`的实参的唯一实例化版本，导致编译失败

```cpp
void func(int(*)(const int&, const int&));
void func(int(*)(const string&, const string&));
func(compare); // 编译失败：多个重载函数 func 实例与参数列表匹配
```

但可以显示指出需要实例化的版本

```cpp
func(compare<int>);
```

题外话：这里我把`func(compare<int>)`放在全局，会报错，显示没有存储类或类型说明符，必须要放到一个函数内（没搞明白为什么）

```cpp
void Test()
{
	func(compare<int>);
}
```


---
# 模板实参推断和引用




