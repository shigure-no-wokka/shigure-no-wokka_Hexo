---
title: Cpp 多线程：条件变量
date: 2024-04-15 19:54:17
description: C++ 多线程
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_code.jpg
categories: Code
tags:
  - 多线程
  - Cpp
---

参考链接：https://murphypei.github.io/blog/2017/08/cpp11-multithread.html

条件变量：`std::condition_variable`，C++11 提供的一种同步机制，用来阻塞一个或多个线程，直到接收到另一个线程的通知信号

# 两种实现

- `condition_variable`：所有需要等待这个条件变量的线程，都需要持有一个`unique_lock`
- `condition_variable_any`：更通用的实现，但性能和系统资源上消耗多

# 工作机制

- 至少有一个线程在等待某个条件成立
  - 等待的线程必须提前持有一个`std::unique_lock`，并传递给`condition_variable`的`wait()`方法
  - `wait()`释放`mutex`并阻塞线程直至收到通知信号
  - 收到通知信号后，线程唤醒，重新持有``timed_mutex`
- 至少有一个线程在发送条件成立的通知信号
  - 发送方法`notify_one()`，解锁任意一个在等待信号的线程
  - `norify_all()`，唤醒等待通知信号的线程

# 伪唤醒

>> 在多核处理器系统上，由于使条件唤醒完全可预测的某些复杂机制的存在，可能发生伪唤醒，即一个线程在没有别的线程发送通知信号时也会唤醒。

因而，唤醒线程时，需要检查条件是否成立，**伪唤醒也可能多次发生，需要在一个循环里进行条件检查**


# 应用示例

```cpp
bool produce_done = false;
bool product_ready = false;
std::condition_variable cv;
std::mutex mtx;
std::queue<int> productions;
void producer()
{
  for(int i=0; i<10; i++)
  {
    // Producing process
    // ...
    // Product ready
    std::unique_lock<std::mutex> lock(mtx);
    productions.push(i);
    product_ready = true;
    cv.notify_all();
  }
  produce_done = true;
}
void consumer()
{
  std::unique_lock<std::mutex> lock(mtx);
  while(!produce_done || !productions.empty())
  {
    while(!product_ready)
    {
      cv.wait(lock);
    }
    while(!productions.empty())
    {
      productions.front();
      productions.pop();
    }
    product_ready = false;
  }
}
```



