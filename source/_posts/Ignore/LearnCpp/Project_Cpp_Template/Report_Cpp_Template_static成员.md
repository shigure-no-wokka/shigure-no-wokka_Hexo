---
title: C++ 模板：static 成员
date: 2024-04-26 20:06:07
description: C++ 模板学习
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_code.jpg
categories: Code
tags:
  - 模板
  - Cpp
---

类模板里可以有`static`成员，当类模板被模板实参实例化后，这个`static`成员也会被实例化，并且被该实例类型的所有对象共享。

```cpp
template<typename T>
class MyClass
{
public:
    static int id;
    static int GetID() { return id; }
};

// 不要忘了类外定义
template<typename T>
int MyClass<T>::id = 0;
```

如果此时生成一个`MyClass<int>`实例类类型，那么这两个`static`成员就被全部的类型为`MyClass<int>`的对象共享

```cpp
MyClass<int> test_MyClass;
std::cout << test_MyClass.GetID() << std::endl;
MyClass<int>::id = 1919810;
std::cout << MyClass<int>::GetID() << std::endl;

// 这种是不对的
MyClass::GetID(); // 缺少类模板`MyClass`的参数列表
```


