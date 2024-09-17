---
title: Cpp 多线程：互斥量
date: 2024-04-15 19:52:14
description: C++ 多线程
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_code.jpg
categories: Code
tags:
  - 多线程
  - Cpp
---

参考链接：https://murphypei.github.io/blog/2017/08/cpp11-multithread.html

# 互斥量

`std::mutex`

`#include <mutex>`

# 四种实现

- `mutex`：核心的`lock()`和`unlock()`方法；`try_lock()`为非阻塞方式，如果`mutex`不可用会返回
- `recursive_mutex`：同一线程多次持有`mutex`
- `timed_mutex`：和`mutex`类似，增加`try_lock_for()`和`try_lock_until()`，便于在特定时长内持有`mutex`
- `recursive_timed_mutex`：如名

# 基础使用示例

```cpp
std::mutex mtx; // 创建 mutex 变量
int a = 0; // 模拟共享资源
void Func1()
{
    mtx.lock(); // 对共享资源处理时先尝试获取锁
    std::cout << "Inside Func1 Before: " << a << std::endl;
    a++;
    std::cout << "Inside Func1 After: " << a << std::endl;
    mtx.unlock(); // 执行完毕释放锁
}
void Func2()
{
    mtx.lock(); // 对共享资源处理时先尝试获取锁
	std::cout << "Inside Func2 Before: " << a << std::endl;
	a++;
	std::cout << "Inside Func2 After: " << a << std::endl;
    mtx.unlock(); // 执行完毕释放锁
}

void Test_mutex() {

    thread t1(Func1);
    thread t2(Func2);

    cout << "Check Original: " << a << endl;
    t1.join();
    cout << "After Func1: " << a << endl;
    t2.join();
    cout << "After Func2: " << a << endl;
}
```

输出结果：

```cpp
Check Original: 0
Inside Func2 Before: 0
Inside Func2 After: 1
Inside Func1 Before: 1
Inside Func1 After: 2
After Func1: 2
After Func2: 2
```

# 避免死锁（Dead Lock）

死锁的情况：**一个进程获取了锁，执行完毕后没有释放锁，导致其他进程无法获取资源**

C++11 引入：
- `lock_guard`，将`mutex`的上锁和释放时机与`lock_guard`对象的生命周期绑定
  - `lock_guard`创建时，`mutex::lock()`
  - `lock_guard`析构时，`mutex::unlock()`
  - **`lock_guard`不允许拷贝**
- `unique_lock`：不可拷贝，但可以转移

```cpp
std::mutex mtx1;
std::lock_guard<std::mutex> glock(mtx1);

std::mutex mtx2;
std::unique_lock<std::mutex> ulock(mtex2);
```


