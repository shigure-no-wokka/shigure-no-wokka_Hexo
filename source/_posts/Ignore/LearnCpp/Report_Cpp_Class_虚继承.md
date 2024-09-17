---
title: Cpp 类：虚继承
date: 2024-05-02 10:04:28
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_code.jpg
categories: Code
tags:
  - Cpp
---

# 分析

假如有如下继承链：

```cpp
class Base
{
public:
	virtual ~Base() = default;

	int a = 0;
};
class Base1 : public Base {};
class Base2 : public Base {};

class Final : public Base2, public Base1 {};
```

如上述代码，我们声明了一个基类 Base，两个派生类 Base1 和 Base2，以及最终的 Final 类。按照上面的实现，在 Final 类中，其实是存在两份基类 Base 的副本的（**浪费空间**），如果要访问来自 Base 的某个成员变量，编译期会不知道这个成员变量到底是从 Base1 这边的 Base 还是从 Base2 这边的 Base 过来的，**属性存在二义性**，编译器会报错，如下：

```cpp
class Final : public Base1, public Base2 {

public:
	void PrintProp()
	{
		this->a = 1; // 编译报错：Final::a 不明确
	}
};
```

可以在成员变量 a 之前声明来自哪个类：

```cpp
class Final : public Base1, public Base2 {

public:
	void PrintProp()
	{
		Base1::a = 1;
		Base2::a = 2;
		Base::a = 1024;

		std::cout << Base1::a << std::endl; // 1024
		std::cout << Base2::a << std::endl; // 2
		std::cout << Base::a << std::endl; // 1024
	}
};
```

可以看到，当显式指明使用来自 Base 基类的成员时，他修改的是 Final 继承的第一个基类 Base1 中的 Base 属性。如果修改继承顺序：

```cpp
class Final : public Base2, public Base1 {

public:
	void PrintProp()
	{
		Base1::a = 1;
		Base2::a = 2;
		Base::a = 1024;

		std::cout << Base1::a << std::endl; // 1
		std::cout << Base2::a << std::endl; // 1024
		std::cout << Base::a << std::endl; // 1024
	}
};
```

和之前相同，直接通过`Base::a`修改的，只是 Final 继承的第一个基类中的间接基类。并且这样表明了，两个直接继承基类中的 Base 其实是不相关的。



为了避免这种情况，可以采用虚继承

```cpp
class B : virtual public A {};
class C : virtual public A {};
```

这样，最终的 Final 类中，只存在一份 A 类的副本。再次调用 Final 的 PrintPro 函数发现输出为：

```cpp
class Final : public Base2, public Base1 {

public:
	void PrintProp()
	{
		Base1::a = 1;
		Base2::a = 2;
		Base::a = 1024;

		std::cout << Base1::a << std::endl; // 1024
		std::cout << Base2::a << std::endl; // 1024
		std::cout << Base::a << std::endl; // 1024
	}
};
```

说明，此时 Final 中的 Base 只存在一份

# 实现

虚继承底层实现与编译器相关，一般通过**虚基类指针**和**虚基类表**实现。声明了虚继承的子类中都有一个虚基类指针（一个指针空间）和虚基类表（不占用对象的存储），当虚继承的子类作为父类被继承时，虚基类指针也会被继承

- 虚基类指针：指向虚基类表
- 虚基类表：记录虚基类与直接继承类（也就是声明虚继承的那个子类）的偏移地址


# 参考链接

- [C++ 虚继承实现原理（虚基类表指针与虚基类表）](https://blog.csdn.net/longlovefilm/article/details/80558879)

