---
title: Cpp 模板：匹配失败不是错误
date: 2024-04-26 20:10:30
description: C++ 模板学习
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_code.jpg
categories: Code
tags:
  - 模板
  - Cpp
---

使用 C++ 模板时，编译器会根据传入的模板参数列表和形参列表去匹配定义好的模板函数。如果模板函数匹配失败，就会寻找其他模板函数进行匹配直到找到一个匹配的或全部都不匹配，除非全部都不匹配，否则单个模板函数匹配失败不会报错。

利用这种原则，就可以结合模板实现针对性的函数实例构建

```cpp
// 匹配非 POT 类型
template<typename T>
void Function(typename std::enable_if<!(std::is_trivial_v<T> && std::is_standard_layout_v<T>), const T&>::type InT)
{}

// 匹配 POT 类型
template<typename T>
void Function(typename std::enable_if<std::is_trivial_v<T> && std::is_standard_layout_v<T>, const T&>::type InT)
{}
```


## `std::enable_if` 是怎么回事？
为什么这个就可以实现这种选择性匹配的效果？

实际上，`std::enable_if<>` 本质上也是一个模板类，假如我们自定义一个模板类：

```cpp
template<bool Value, typename T>
struct Test {};
```

由于只有一个模板，无论 `value` 取值，都会根据这个模板进行实例创建

这里需要用到类模板的特化：

```cpp
// 特化 bool Value
template<typename T>
struct Test<true, T>
{
	typename T type;
};
```

举例：

```cpp
template<typename T>
void Function(typename Test<!(std::is_trivial_v<T> && std::is_standard_layout_v<T>), const T&>::type InT) 
{
	std::cout << "Is not POT!" << std::endl;
}

template<typename T>
void Function(typename Test<(std::is_trivial_v<T> && std::is_standard_layout_v<T>), const T&>::type InT) 
{
	std::cout << "Is POT!" << std::endl;
}
```

通过上边的例子，我们也可以实现 `std::enable_if` 的效果，如果 `T` 是 POT 类型，就会走下边那个函数模板创建实例；如果 `T` 不是 POT 类型，就走上边那个函数模板创建。

相当于是，利用类模板的特化，使得函数模板的模板参数中实现了逻辑分支（而实际上两个函数模板中的模板 Test 走的都是特化版本的，因为第一个模板参数都是 true）。

# 这么写有啥好处？

可以想象一下，有些我们自定义的复杂类型，它的构造函数，拷贝构造函数等等，内部实现比较复杂，除了 POT 类型，其他都不能直接使用 `memcpy`，这就导致我们需要针对这些特殊的类型去定义接收对应类型的函数或模板。

举例：
```cpp
template<typename T>
void Copy(T* Dst, T* Src)
{
	if(std::is_trivially_copyable_v<T>)
	{
		memcpy(Dst, Src, sizeof(T));
	}
	else
	{
		new (Dst) T(*Src);
	}
}
```

上边的例子会针对传入的变量是否可以直接 `memcpy` 分别进行了两种情况的讨论，但这种写法会导致无论传入的类型是否为可拷贝的，都会生成一个包含了两种情况代码的函数示例。

所以这里就可以利用之前学到的写法，在模板参数中对类型进行判断，然后选择性生成对应的函数。

```cpp
// 可以 memcpy 的
template<typename T>
void Copy(typename std::enable_if<std::is_trivially_copyable<T>::value, void*>::type Dst, T* Src)
{...} // 具体实现暂时不管

// 不可以 memcpy 的
template<typename T>
void Copy(typename std::enable_if<!std::is_trivially_copyable<T>::value, void*>::type Dst, T* Src)
{...} // 具体实现暂时不管
```

这样，就可以根据传入的类型是否为可拷贝的选择 `memcpy` 还是自行定义拷贝方式了

# “匹配失败不是错误”的又一处应用

上边的例子是直接实现的两个模板函数，如果在一个模板类内部实现的话：
```cpp
template<typename InElementType>
class Test
{
public:
	template<typename U = InElementType>
	void Copy(typename std::enable_if<std::is_trivially_copyable<T>::value, void*>::type Dst, void* Src)
	{...} // 具体实现暂时不管
	
	template<typename U = InElementType>
	void Copy(typename std::enable_if<!std::is_trivially_copyable<T>::value, void*>::type Dst, void* Src)
	{...} // 具体实现暂时不管
};
```

思考一个问题：**模板类已经接收一个类型参数了，为什么类里边的函数也要设置成模板？**

首先来看一下，这两个成员函数不是模板函数的情况。

按照我们之前自定义写的一个用来匹配模板参数的结构体，可以发现当模板参数的 `Value` 为 `False` 时，其内部不存在 `type` 这个成员。也就是说：
- 当我们给上边这个例子传入一个 `string` 类型，如果成员函数都为普通函数，那么第一个函数中 `std::is_trivial_copyable<T>::value` 就会为 `False`
- 而此时这个 `std::enable_if` 中是不存在 `type` 的，从而发生编译错误，如下图所示

![[Pasted image 20240404120110.png]]

这是因为，无论传入的类型是否为可拷贝，这两个函数都是跟随一个类的对象而存在的，这就导致了其中一个函数匹配为 `std::enable_if<true, void*>`，而另一个 `std::enable_if<false, void*>`，但失败的这个是不存在 `type` 成员的。

如果设置成模板成员函数后就没有问题，这是因为模板的"匹配失败不是错误"的特性，只有匹配成功后才会生成对应的函数实例。

```cpp
template<typename InElementType>
class Test
{
public:
    template<typename U = InElementType>
    void Copy(typename std::enable_if<std::is_trivially_copyable<U>::value, void*>::type Dst, void* Src)
    {
        std::cout << "Trivially Copyable" << std::endl;
    }
    
    template<typename U = InElementType>
    void Copy(typename std::enable_if<!std::is_trivially_copyable<U>::value, void*>::type Dst, void* Src)
    {
        std::cout << "Not Trivially Copyable" << std::endl;
    }
};
```

`std::enable_if` 的实现大致如下：
```cpp
  // Primary template.
  /// Define a member typedef `type` only if a boolean constant is true.
  template<bool, typename _Tp = void>
    struct enable_if
    { };

  // Partial specialization for true.
  template<typename _Tp>
    struct enable_if<true, _Tp>
    { typedef _Tp type; };
```

可以看到，和本文之前实现的是一样的。那么当 `is_trivially_copyable<U>::value` 为 `false` 时，编译器会去匹配原本的版本而不是特化为 `true` 的版本，但原本的内部不存在 `type` 成员，从而导致匹配失败，因而编译器不会去实例化这个版本。 




