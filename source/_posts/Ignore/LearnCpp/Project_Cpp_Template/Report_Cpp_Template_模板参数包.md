---
title: Cpp 模板：模板参数包
date: 2024-04-26 20:18:02
description: C++ 模板学习
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_code.jpg
categories: Code
tags:
  - 模板
  - Cpp
---

```cpp
#include <iostream>

void sumAndPrint() {
    // 递归终止条件：当没有参数时，结束递归
    std::cout << std::endl;
}

template<typename T, typename... Args>
void sumAndPrint(T first, Args... args) {
    // 处理第一个参数
    std::cout << first << " ";
    
    // 递归调用处理剩余参数
    sumAndPrint(args...);
}

int main() {
    sumAndPrint(1, 2, 3, 4, 5);
    return 0;
}
```

上述例子中出现了 `typename... Args` 和 `Args... args`，这两个分别表示模板参数包和函数参数包
- `typename... Args`：在模板实例化时，会被实例化为一个类型列表
- `Args... args`：则包含了零个或多个参数，可以通过 `args...` 展开并传递给函数


