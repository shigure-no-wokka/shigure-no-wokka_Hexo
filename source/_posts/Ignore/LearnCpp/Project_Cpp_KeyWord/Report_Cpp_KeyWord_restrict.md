---
title: C++ 关键字：restrict
date: 2024-04-03 19:48:14
description: C++ 关键字
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_code.jpg
categories: Code
tags:
  - 关键字
  - Cpp
---

概念引入：

```cpp
int Add(int* a, int* b)
{
    *a = 3;
    *b = 2;
    
    return *a+*b;
}
```

上述代码的目的是实现俩个整型数据的求和计算，但存在隐患。  

如果 a 和 b，分别指向不同的整型对象，最后的计算结果是正确的。  

但是如果 a 和 b，同时指向同一个对象，根据代码可知：`*a=3` 会将指针指向对象更新为 3，`*b=2` 又会将对象更新为 2，最后 `*a+*b` 的结果实际上是 4

在 C 语言中，restrict 关键字修饰指针（C 99）可以提示编译器：在指针的生命周期中，其指向的对象不会被其他指针引用。

在 C++ 中，没有明确的统一标准支持 restrict 关键字，但是很多编译器实现了相同功能的关键字：gcc 和 clang 中的 `__restrict` 关键字

所以，上述代码可以更新为：

```cpp

int Add(int* __restrict a, int* __restrict b)

{

    *a = 3;

    *b = 2;

    return *a + *b;

}

```

这里可以对比二者在 clang 编译器下的汇编代码来观察优化（[CompilerExplorer](https://godbolt.org/)，选择 `x86-64 clang(trunk) -O3`）

```assembly
// 不使用 __restrict
Add(int*, int*):                             # @Add(int*, int*)
        mov     dword ptr [rdi], 3
        mov     dword ptr [rsi], 2
        mov     eax, dword ptr [rdi] // 多了一步对a所指内存地址的访存步骤
        add     eax, 2
        ret
// 使用 __restrict
Add(int*, int*):                             # @Add(int*, int*)
        mov     dword ptr [rdi], 3
        mov     dword ptr [rsi], 2
        mov     eax, 5
        ret
```

