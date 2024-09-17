---
title: kama54.替换数字
date: " 2024-08-31 12:21 "
description: 
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_code.jpg
categories: Code
tags:
  - LeetCode
---

题目链接：

给定一个字符串 s，它包含小写字母和数字字符，请编写一个函数，将字符串中的字母字符保持不变，而将每个数字字符替换为 number。

例如，对于输入字符串 "a 1 b 2 c 3"，函数应该将其转换为 "anumberbnumbercnumber"。

对于输入字符串 "a 5 b"，函数应该将其转换为 "anumberb"

输入：一个字符串 s, s 仅包含小写字母和数字字符。

输出：打印一个新的字符串，其中每个数字字符都被替换为了 number

样例输入：a 1 b 2 c 3

样例输出：anumberbnumbercnumber

数据范围：1 <= s.length < 10000。

<!--more-->

---

# 题解

对于输入的字符串，遍历字符串，找出其中的数字字符，并将数字字符替换成 `number`

问题在于，需要扩充字符串长度，以及需要将元素逐个后移

如果涉及到要扩充定长数组及元素插入导致元素后移，可以选用**从后向前替换字符的思路**

借用双指针，都从数组最后开始向前遍历，将旧指针位置字符移动到新指针位置，如果旧指针为数字字符，就直接插入`number`

```cpp
#include <iostream>
using namespace std;
int main()
{
    // 接受输入字符
    string s;
    cin >> s;
    // 记录输入字符中数字字符个数
    int count = 0;
    for(auto &c:s)
    {
        if(c >= '0' && c <= '9') count++;
    }
    // 旧指针
    int pOld = s.size() - 1;
    // 新指针
    s.resize(s.size() + count * 5);
    int pNew = s.size() - 1;
    // 交换新旧 string
    while(pOld >= 0)
    {
        if(s[pOld] >= '0' && s[pOld] <= '9')
        {// 是数字则替换
            s[pNew--] = 'r';
            s[pNew--] = 'e';
            s[pNew--] = 'b';
            s[pNew--] = 'm';
            s[pNew--] = 'u';
            s[pNew--] = 'n';
        }
        else
        { //不是数字则放到新数组的对应位置
            s[pNew--] = s[pOld];
        }
        // 更新旧指针，新指针已经在替换时更新
        pOld--;
    }
    // 打印更换后
    cout << s << endl;
}

```


