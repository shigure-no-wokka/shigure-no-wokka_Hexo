---
title: Cpp 模板：编译期常量和模板元编程
date: 2024-04-26 20:15:04
description: C++ 模板学习
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_code.jpg
categories: Code
tags:
  - 模板
  - Cpp
---

参考链接：[C++ 中的编译器常量和模板元编程](https://simonzgx.github.io/2020/10/20/C++%E4%B8%AD%E7%9A%84%E7%BC%96%E8%AF%91%E5%99%A8%E5%B8%B8%E9%87%8F%E5%92%8C%E6%A8%A1%E6%9D%BF%E5%85%83%E7%BC%96%E7%A8%8B/)

# 编译期常量

- 是什么？  
编译期常量，顾名思义，就是在编译期间就可以确定的常量。

- 有什么？  
在 C++ 中，像变量类型、数组、switch 的 case 以及模板，都是编译期常量常出现的地方


## 数组大小

如果想创建一个静态数组，就需要显式指定一个 size，并且需要在编译期间就可以知道

```cpp
int someArray[100];
```

如果这个数组在函数中，数组的内存会被存放在函数的栈帧之中；如果是类的成员，编译器就需要确定这个数组的大小从而确定类的大小。

所以，无论哪种情况，编译器需要知道这个数组的 size。故静态数组的大小是编译期常量，**从而编译器就可以准确计算出这个数组所需要分配的内存**

有时候编译器可以帮忙计算出数组的大小

```cpp
int someArray[] = {1, 2, 3};
char charArray[] = "Test Array"; // 注意 char 要包括 \0 的空字符哦
```

## 模板

模板的参数也是编译期常量

```cpp
enum Color {RED, GREEN, BLUE};
template<unsigned long N, char ID, Color C>
struct someStruct {};
someStruct<42ul, 'e', GREEN> theStruct;
```

## switch-case 语句

switch 语句的分支判断也是编译期常量

```cpp
void comment(int phrase)
{
    switch(phrase){
        case 42:
        std::cout << "You are right!" << std::endl;
        break;
        case BLUE:
        std::cout << "Don't be upset!" << std::endl;
        break;
        case 'z':
        std::cout << "Follow your heart!" << std::endl;
        break;
        default:
        std::cout << "Study, make yourself better!" << std::endl;
    }
}
```

#  编译期常量的好处

编译期常量可以用来做什么呢？

## 更安全

可以直接在编译期间就体现出逻辑性

这里举出一个例子：矩阵相乘

```cpp
class Matrix
{
    unsigned rowCount;
    unsigned columnCount;
};

Matrix operator*(Matrix const& lhs, Matrix const& rhs)
{
    if(lhs.getColumnCount() != rhs.getRowCount())
    {
        throw OhWeHaveProblem();
    }
}
```

例如上述代码，如果可以在编译期间就确定两个矩阵能否相乘，可以直接阻止错误的发生。




