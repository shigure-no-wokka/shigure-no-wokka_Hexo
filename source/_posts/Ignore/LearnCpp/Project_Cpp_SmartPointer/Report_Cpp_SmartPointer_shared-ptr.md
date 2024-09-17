---
title: Cpp 智能指针：shared_ptr
date: 2024-04-03 19:57:11
description: C++ 关键字
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_code.jpg
categories: Code
tags:
  - 智能指针
  - Cpp
---

# 前言

`shard_ptr` 和 [C++ 模板：判断类中是否存在某个成员函数](../C++模板/C++模板：判断类中是否存在某个成员函数.md)的联系

假设有以下代码：

```cpp
class A{};
class A1{};
class B : public A, public A1 {};
vois Test()
{
	std::shared_ptr<B> b = std::make_shared<B>();
	std::shared_ptr<A1> a1 = b;
}
```

这里将 B 的智能指针强转为了 A 1 的智能指针，在内存细节上这个指针的位置会发生偏移。如果此时析构 a 1，很可能导致 b 没有正确析构。

所以在智能指针的实现中，除了将 b 的引用计数以及指针拷贝给 a 1，还会将管理 b 的这块内存区域的一个 deletetor 同样传给 a 1。

这样，在 a 1 析构的时候，自动调用这块内存区域的 deletetor，所以 b 也会被正确销毁掉。

而此时，就需要考虑到**这个 deletetor 是否合法**，也就是判断传入的类型中，是否存在这个 deletetor 从而保证正确调用

# 课前思考

智能指针的引用计数放在哪里？

- 引用计数一般会和指针一起放在一个单独的控制块（control block）中
- 在智能指针 shared_ptr 储存的实际上是指向这个控制块的指针，也就是这些智能指针共同管理一个 control block

# 实现尝试

实现控制块：
```cpp
template<typename T>
class ControlBlock
{
public:
	int RefCount = 0; // 引用计数
	T* Ptr = nullptr; // 指向对象的指针

ControlBlock(T* _ptr) : Ptr(_ptr) {}

// 管理计数
	void AddRefCount()
	{
		RefCount += 1;
	}
	void Release()
	{
		if(--RefCount == 0)
		{
			delete Ptr; // 这里和控制块不在同一片内存，可以直接 delete，放一起要调用析构，PTr->~T();
			delete this; // 在 Release 里处理对象的释放
			// 实际上不是这么写的，因为还需要对所有指向该对象的 shared_ptr 和 weak_ptr 都进行销毁
			// 带着这个疑问“什么时候销毁控制块”往后看
		}
	}
};
```

实现智能指针：
```cpp
template<typename T>
class TSimpleSharedPtr
{
public:
	ControlBlock<T>* p_control_block = nullptr;
	TSimpleSharedPtr() = default;
	// 传递裸指针
	TSimpleSharedPtr(T* ptr) : p_control_block(new ControlBlock<T>(ptr)) 
	{
		p_control_block->Ptr = ptr;
		p_control_block->AddRefCount();
	}
	// 拷贝构造
	TSimpleSharedPtr(const TSimpleSharedPtr& Other) : p_control_block(Other.p_control_block)
	{
		if(p_control_block)
		{
			p_control_block->AddRefCount();
		}
	}
	// 重载赋值操作符
	TSimpleSharedPtr& operator=(const TSimpleSharedPtr& Other)
	{
		// 排除自我赋值
		if(this == &Other) return *this;
		// 释放自己的 RefCount
		if(p_control_block)
		{
			p_control_block->Release();
		}
		// 赋值
		p_control_block = Other.p_control_block;
		p_control_block->AddRefCount();
		return *this;
	}
};
```

# 问题思考：转型问题（智能指针的排他性）

假如有以下代码：
```cpp
std::shared_ptr<B> b = std::make_shared<B>();
std::shared_ptr<A1> a1 = b;
std::shared_ptr<B> b2(static_cast<B*>(a1.get()));
```

注意这里：`std::shared_ptr<B> b2(static_cast<B*>(a1.get()));` 
将一个裸指针转型为了 B 类型指针，进而构建了 b 2 这个对象。 
但是回想之前利用裸指针创建智能指针对象的实现过程，`p_control_block(new ControlBlock<T>())`，也就是直接重新 new 了一个 control block。 
也就是说，b 和 b 2 的指针虽然指向同一个对象，但是负责管理这个对象的 control block 却有两个。

所以需要对这个指针进行一次强制转型：`std::shared_ptr<B> b2 = std::static_pointer_cast<B>(a1);`，或者是自己实现一个隐式转型

以及传入的类型可能是一个数组，如果直接使用传入的类型 T，很有可能出现数组指针的情况。所以结合 [C++ 模板：判断是否为数组](../C++模板/C++模板：判断是否为数组.md) 对传入的类型进行判断

```cpp
template<typename T>
class TSharedPtr
{
using Tx = std::conditional<std::is_array_v<T>, T, std::remove_extent_t<T>>; // 这里判断传入的 T 是不是一个数组
// 如果是数组就取数组内元素的类型
Tx* Ptr{nullptr}; // 后续转型用
};
```

综上，构造智能指针的时候需要考虑：
- 裸指针
- 基类和子类的转型
- 数组类型的转型

```cpp
template<typename T>
class TSharedPtr
{
	using Tx = std::conditional<std::is_array_v<T>, T, std::remove_extent_t<T>>;
};
```

# 问题思考：控制块删除时机问题（有 weak_ptr 的情况下）

目前实现的版本中，控制块和所管理的对象不在同一位置。如果需要拿到这个对象，需要对控制块解引用，再对指针解引用，两次跳转。

而对于 C++ 中的智能指针，通过 `std::make_shared<T>()` 创建的智能指针，其内部实现会将控制块和对象放在同一块内存。

此时又有了另一个问题

假如有以下代码：

```cpp
std::shared_ptr<B> b = std::make_shared<B>();
std::shared_ptr<A1> a1 = b;
std::weak_ptr<B> wb = b; // 弱指针
```

由于弱指针不会增加引用计数，所以当智能指针 b 发生析构销毁控制块时，其实仍有一个弱指针 wb 指向这个控制块，这显然会出现问题。

所以，实际上除了有一个对于对象指针的引用计数，还应当存在一个对控制块的引用计数，控制块应当在所有的 shared_ptr 和 weak_ptr 都析构的时候才进行销毁





