---
title: Cpp 关键字：decltype
date: 2024-04-20 19:51:22
description: C++ 关键字
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_code.jpg
categories: Code
tags:
  - 关键字
  - Cpp
---

C++ 11 引入

用于获取表达式类型，举例：
```cpp
int x = 5;
decltype(x) y; // 使用 x 的类型声明了一个 y
```

在模板编程中，`decltype` 常和 `std::declval` 结合使用

在 [C++ 模板：判断类中是否存在某个成员函数](../C++模板/C++模板：判断类中是否存在某个成员函数.md)中，有个判断重载操作符的代码：
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
        return std::is_same_v<RR, Ret>;
    }  
    static constexpr bool Check(...) { return false; }
    enum
    {
        value = Check(static_cast<T*>(nullptr))
    };
};
constexpr bool test = THasOperatorParentheses<A, int, float&>::value;
```

在模板参数列表中 `typename ... Args`，表示 Args 是一个可变参数列表，接收任意类型或任意个数的参数

接下来大概整理一下 `template<typename U, typename RR = decltype(std::declval<U>()(std::forward<Args>(std::declval<Args>())...))>` 这里的细节

-  `decltype` 用于获取一个表达式的类型
-  `std::declaval<U>()` 则是创建了一个类型 U 的假想对象
- `std::forward<Args>(std::declval<Args>())` 内部的 `std::declval<Args>()` 同理创建了一个假想的参数列表，通过 `std::forward<Args>` 保持参数的值类别（左值还是右值）
- `(std::forward<Args>(std::declval<Args>())...)` 最后的 `...` 表示将参数包 `Args` 展开

综上，通过 `std::declaval<U>()` 创建一个假想 U 类型的对象，利用 `std::forward<Args>(std::declval<Args>())` 创建假想 Args 参数列表并通过 `std::forward<Args>` 保持值类别，`...` 将参数包展开从而传入类型 U 的假想对象的参数列表中


# decltype 和 auto 对比

- auto 不能适用所有的自动类型推导，特殊情况下 auto 使用不方便甚至无法使用
- auto 根据赋值运算符右侧的初始值推断类型，decltype 根据传入的表达式类型推断和右侧初始值无关
- auto 要求变量必须初始化（因为 auto 要用初始值来推导类型），decltype 则不要求


# decltype 的推导规则

`decltype(exp) var;`

1. 如果 exp 是一个不被括号包围的表达式，或者是一个类成员访问表达式，或是一个单独的变量，则推导的类型和 exp 一致（exp 不能是 void，会导致编译错误）
2. 如果 exp 是函数调用，推导类型回合函数返回值一致，使用方式：`decltype(returnForDecltype()) var;`，如果有参数还需要加上参数（不会真正执行代码）
3. 如果 exp 是一个左值，或者被括号包围，则推导类型为 exp 的引用
