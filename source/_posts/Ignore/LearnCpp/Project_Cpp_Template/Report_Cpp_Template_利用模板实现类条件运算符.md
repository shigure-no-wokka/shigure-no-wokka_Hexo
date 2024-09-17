---
title: Cpp 模板：利用模板实现类条件运算符
date: 2024-04-26 20:09:38
description: C++ 模板学习
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_code.jpg
categories: Code
tags:
  - 模板
  - Cpp
---

根据条件真假，返回对应类型

```cpp
template<bool value, typename T1, typename T2>
struct ConditionT {};
template<typename T1, typename T2>
struct ConditionT<true, T1, T2>
{
	typedef T1 typeT;
};
template<typename T1, typename T2>
struct ConditionT<false, T1, T2>
{
	typedef T2 typeT;
};

void test()
{
	typename ConditionT<true, int ,float>::typeT type_T;
	static_assert(std::is_same_v<decltype(type_T), int>, "type_T is not int");
	// 静态断言失败
	// static_assert 的第二个参数会作为错误信息或原因返回
	// "静态断言失败，原因是“typename ConditionT::typeT is not int”"
	static_assert(std::is_same_v<typename ConditionT<false, int, float>::typeT, int>, "typename ConditionT::typeT is not int");
}
```

