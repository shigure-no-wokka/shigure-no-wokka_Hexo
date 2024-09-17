---
title: Cpp 多线程：单生产者单消费者
date: 2024-04-16 19:53:03
description: C++ 多线程
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_code.jpg
categories: Code
tags:
  - 多线程
  - Cpp
---

# 简单的生产者消费者模型

假设存在 A、B 两个线程，二者共享一块内存缓冲区，A 线程负责生产内容**写入缓冲区**，B 线程负责**从缓冲区取出**并消耗内容，其中 A 线程就是生产者，B 线程就是消费者

![alt text](img/生产者消费者模型.png)

# 生产者消费者模型出现的原因

当生产线程的生产速度与消费线程的消费速度不匹配时
- 生产速度 > 消费速度
  - 生产线程必须等待消费线程，防止出现内存存储空间不足
- 生产速度 < 消费速度
  - 消费线程必须等待生产线程，影响产品的使用效率

通过让线程共享一块内存缓冲区，达到两个线程之间解耦的效果。生产线程只需要考虑缓冲区非满状态时处于激活状态生产产品，消费线程只需要考虑缓冲区非空状态时处于激活状态消费产品。

# 模型特点

- 缓冲区满时，生产者不写入，进入休眠状态，直到缓冲区不为满（接收消费者唤醒信号）
- 缓冲区空时，消费者不读取，进入休眠状态，直到缓冲区不为空（接收生产者唤醒信号）


# 简单实现

```cpp
// 信号量
std::condition_variable cv; // 用来互相唤醒
// 配合信号量的标识位
bool production_done = false; // 生产结束了
bool product_ready = false; // 有产品可以消费了
// 互斥量
std::mutex mtx; // 互斥访问缓冲区（配合共享资源一对一？）
// 共享缓冲区
std::queue<int> Productions;

// 生产线程
void Producer()
{
    for(int i=0; i<10; i++)
    {
        std::this_thread::sleep_for(std::chrono::milliseconds(10));
        // 生产线程在产品写入缓冲区前获取锁
        std::unique_lock<std::mutex> lock(mtx); // unique_lock 管理锁和释放时机
        Productions.push(i); // 生产产品
        std::cout << "Producing: " << i << std::endl;
        product_ready = true; // 产品可用
        cv.notify_all(); // 通知消费者线程
    }
    production_done = true; // 全部生产已经结束
}

// 消费线程
void Consumer()
{
    // 先获取锁
    std::unique_lock<std::mutex> lock(mtx);
    while(!production_done || !Productions.empty()) // 生产未结束，或者缓冲区非空都要尝试继续消费
    {
        while(!product_ready) // 防止误唤醒，要在 wait 外多设置一个循环检测
        {
            cv.wait(lock);
        }
        while(!Productions.empty()) // 缓冲区非空才可以真正消费
        {
            std::cout << "Consuming: " << Productions.front() << std::endl;
            Productions.pop();
        }

        product_ready = false; // 消费者将全部产品消费完了
    }
}

void Test_MySPSC()
{
    std::thread t1(Producer);
    std::thread t2(Consumer);
    t1.join();
    t2.join();
}
```



