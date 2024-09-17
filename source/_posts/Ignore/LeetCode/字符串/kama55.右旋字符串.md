---
title: kama55.右旋字符串
date: " 2024-08-31 12:22 "
description: 
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_code.jpg
categories: Code
tags:
  - LeetCode
---

题目链接：

给定一个字符串 s 和一个正整数 k，请编写一个函数，将字符串中的后面 k 个字符移到字符串的前面，实现字符串的右旋转操作。

例如，对于输入字符串 "abcdefg" 和整数 2，函数应该将其转换为 "fgabcde"。

<!--more-->

---

# 题解

假设输入字符串为 `string`，整数为 `2`

| StringInput | s | t | r | i | n | g |
|-------------|---|---|---|---|---|---|
| Old Index   | 0 | 1 | 2 | 3 | 4 | 5 |
| New Index   | 2 | 3 | 4 | 5 | 0 | 1 |

根据表格中可以看到，原字符串可以分为两部分

前边长度为 `n-k` 的子串，和后方长度为 `k` 的子串

于是想到**从整体再到局部**的处理方式
- 先将整个字符串前后反转，从而实现前后方子串分别位于正确位置
- 再分别将子串反转，从而实现子串内部顺序正确

```cpp
void RightMoveString(string& s, int k) {
    // 1. 反转整个字符串
    Reverse(s, 0, s.size()-1);
    // 2. 反转前子串 长度为 k
    Reverse(s, 0, k-1);
    // 3. 反转后子串 长度为 n-k
    Reverse(s, k, s.size()-1);
}
```

