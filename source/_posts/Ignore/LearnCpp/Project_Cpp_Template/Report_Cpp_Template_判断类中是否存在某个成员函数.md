---
title: Cpp 模板：判断类中是否存在某个成员函数
date: 2024-04-26 20:08:14
description: C++ 模板学习
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_code.jpg
categories: Code
tags:
  - 模板
  - Cpp
---

核心：模板的匹配失败不是错误

如果要声明一个指向成员函数的指针：
```cpp
class A
{
	std::string ToString() const;
};

std::string(A::*pF)() const; // 注意这里的解读方式
// *pF：首先说明 pF 是一个指针
// A::*pF：说明是类 A 的成员指针
// std::string(...)() 说明是一个函数指针，返回类型为 std::string
// 最后的 const 说明函数是一个 const 类型
```

如果类 A 中存在成员函数 ToString，返回 std:: string，函数类型为 const，那么可以用下面的模板进行判断：
```cpp
template<typename T>
struct THasToString
{
	// 利用模板，给成员函数指针 pF 赋予一个默认值，如果类 T 中存在这个成员函数就匹配成功，如果不存在就匹配失败
	template<typename U, std::string(T::*pF)() const = &T::ToString>
	static constexpr bool Check(U*) { return true; }

	// 用来匹配不存在成员函数 ToString 的情况
	// ...，省略号参数，可以接收任意数量和任意类型的参数
	// 在这里是为了和上边的模板相对应，保证能够接收参数
	// 不设置模板的原因：这里是为了接收不存在成员函数 ToString 的情况，为了保证其他情况都能被这里接受，所以定义了非模板版本
	static constexpr bool Check(...) { return false; }

	// 枚举值是编译期常量，可以在编译期获得数值
	enum{
		value = Check(static_cast<T*>(nullptr))
	};
};
// 定义一个编译期常量，从而获取判断结果
constexpr bool test = THasToString<A>::value;
```

需要注意，上述代码中，判断的是一个 const 成员函数，在 `constexpr bool test = THasToString<A>::value;` 这里，传入的是一个类 A，如果传入一个 const A，则这个模板只会去匹配 const 版本的 ToString，而如果是之前的，传入一个类 A，他会匹配到 const 版本和非 const 版本。

另一点，为什么在 THasToString 中，可以在模板里直接写 &T:: ToString，如果 T 不存在这个 ToString 呢？
- 这里定义的是一个模板，模板在匹配成功之前是不知道传入的 T 是否有 ToString，只有在匹配的时候才会去尝试生成对应的实例从而判断是否能编译通过
- 如果不通过，对于模板匹配来说，匹配失败不是错误，所以就会跳过这个模板转而去匹配其他的版本
- 所以，在这里不需要关心以后将要传入的 T 到底是不是含有 ToString。


还可以用来判断是否有某个操作符的重载：核心思路是对比返回值和参数列表（但这里不容易找到需要对比的参数列表）
```cpp
class A
{
public:
    int operator()(float&);
};
template<typename T, typename Ret, typename ... Args>
struct THasOperatorParentheses 
{
    template<typename U, typename RR = decltype(std::declval<U>()(std::forward<Args>(std::declval<Args>())...))>
    static constexpr bool Check(U*)
    {
        return std::is_same_v<RR, Ret>; // 确认返回类型是否是我们要找的那个类型
    }  
    static constexpr bool Check(...) { return false; }
    
    enum
    {
        value = Check(static_cast<T*>(nullptr))
    };
};
constexpr bool test = THasOperatorParentheses<A, int, float&>::value;
```

不过，如果将这个重载设置成 private，最后的 test 为 0。但是之前的 ToString 成员函数就算是 private 也能判断。
- 原因是，判断操作符重载时，是利用 `decltype(std::declval<U>()(std::forward<Args>(std::declval<Args>())...))` 假装实例了一个对象然后调用
- 这个调用无法访问私有成员，所以最后的 test 为 0

其他细节见：[[C++关键字：`decltype`]]


但可以和友元函数配合，使用模板在不 UB (Undefined Behavior) 的前提下访问类的私有成员

```cpp
class A
{
private:
	int privateMember = 42;
};
template<int A::*pM>
struct AccessPrivate
{
	friend void TryAccessFunction(A& a)
	{
		std::cout << a.*pm << std::endl;
	}
};
void TryAccessFunction(A& a);
template struct AccessPrivate<&A::privateMember>;

void Test()
{
	A a;
	TryAccessFunction(a);
};
```

实现分析：
- 在上方的代码中，定义了一个类 A，一个模板类 AccessPrivate，它接收一个模板参数，是一个类的整型成员指针
- 在模板类 AccessPrivate 内部，定义了一个友元函数，接收一个类 A 的引用，并打印这个类 A 的整型成员
- 然后声明了这个友元函数签名
- 以及这个模板类 AccessPrivate 的特化版本，利用模板的特化将类 A 的私有成员指针传入友元函数（注意，这里只是特化，想要创建实例会失败的）
- 如果不设置为友元，由于无法创建实例，那么也就不存在函数 TryAccessFunction ()
- 但这里设置为了友元，友元函数并不是该类的成员，也就不存在需要实例化的情况，其本身已经是一个实例。又由于是友元，这个函数享受到了模板特化时传入的类指针，从而实现了对类的私有成员的访问

