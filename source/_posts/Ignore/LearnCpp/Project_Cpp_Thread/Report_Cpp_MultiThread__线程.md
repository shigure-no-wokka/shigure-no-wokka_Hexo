---
title: Cpp 多线程：线程
date: 2024-04-14 19:55:01
description: C++ 多线程
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_code.jpg
categories: Code
tags:
  - 多线程
  - Cpp
---

`std::thread`是 C++11 中对线程的封装

```cpp
#include <thread>
```

# 基础示例

定义两个函数用于双线程模拟

```cpp
void function1() {
    std::cout << "Inside function1" << std::endl;
}

void function2() {
    std::cout << "Inside function2" << std::endl;
}
```

使用`std::thread`创建两个线程

```cpp
int Test_MyThread() {
    // 传入函数指针构造 thread 对象
    std::thread t1(function1);
    std::thread t2(function2);

    t1.join();
    t2.join();

    return 0;
}
```

输出：

```cpp
>>> Inside function2Inside function1
>>> 
>>> Hello World!
```

---

# 创建线程

`std::thread`的构造函数如下：

```cpp 
thread() noexcept; // 默认构造函数，不表示任何线程
thread(thread&& Other) noexcept; // 移动构造函数（Other 传入之后不表示任何线程）
thread(const thread&) = delete; // 禁止拷贝构造，线程不可拷贝（没有两个线程能表示同一个执行线程）
// 拷贝复制运算符
thread& operator=(const thread&) = delete;
thread& operator=(thread&& rhs) noexcept;

// 构造 thread 对象，并与执行线程关联（joinable）
template<class F, class... Args>
explicit thread(F&& f, Args&&... args);
```

一般使用的都是最后一个，传参构建线程

# 两种传参方式

传参有两种方式：值传递和引用传递

- 对于值传递：`std::thread(FunctionName, args)`
- 对于引用传递，需要使用`std::ref`或`std::cref`封装，`std::thread(FN, std::ref(args))`


# `join` 和 `detach`

对于创建的线程，一般会在销毁前调用`join`和`detach`

- `join`：阻塞调用者所在线程，直至被`*this`表示的线程完成执行
  - 只有活动状态的线程才能调用`join`，即`joinable()==true`
  - 默认构造函数创建的对象为`joinable()==false`
  - `join`被调用一次就会变为`joinable()==false`，表示线程执行完毕
  - 调用`terminate()`的线程必须是`joinable()==false`
  - 如果线程不调用`join`，就算执行完成也是一个活动线程，即`joinable()==true`
- `detach`：将`thread`对象和其表示的执行线程分离，`*this`将不再拥有任何线程
  - 分离之后，线程单独执行，直到执行完毕并释放资源
  - 分离之后，`thread`不再表示任何线程，且`joinable()==false`，即使线程此时还在执行

# 获取线程 ID

每个线程都有一个标识符，可以通过两种方式获取：

- `thread_obj.get_id();`
- `std::this_thread::get_id();`

**空 `thread()` 对象，即不表示任何线程的 `thread_obj` 调用 `get_id()` 结果为 0**

```cpp
// 创建线程
std::thread t1(function1);

// detach 之前输出线程 id
std::cout << "Thread 1 ID before detach: " << t1.get_id() << std::endl;

if (t1.joinable()) t1.detach();

// detach 之后输出线程 id
std::cout << "Thread 1 ID after detach: " << t1.get_id() << std::endl;
```

输出结果：

```cpp
Thread 1 ID before detach: 29868
Inside function1
Thread 1 ID after detach: 0
```

**detach 后，修改的线程 id 只是 thread_obj 内部记录的，和线程本身无关**

```cpp
void function1() {
    // 在线程内部获取
    std::cout << "Thread 1 ID(inside function1): " << std::this_thread::get_id() << std::endl;
}
```

输出结果：

```cpp
Thread 1 ID(inside function1): 29868
```

# 交换两个`thread`对象表示的线程

`thread::swap`的实现：
```cpp
void swap(thread& _Other)
```

用例：

```cpp
int main() {
    thread t1(function1);
    thread t2(function2);
    cout << "current thread id: " << this_thread::get_id() << endl;
    cout << "before swap: "<< " thread_1 id: " << t1.get_id() << " thread_2 id: " << t2.get_id() << endl;
    t1.swap(t2);
    cout << "after swap: " << " thread_1 id: " << t1.get_id() << " thread_2 id: " << t2.get_id() << endl;
    t1.join();
    t2.join();
}
```

输出结果：

```cpp
before swap:  thread_1 id: 32340 thread_2 id: 26796
after swap:  thread_1 id: 26796 thread_2 id: 32340
```

# 问题汇总

## 创建线程后，如果既不`join`也不`detach`，会发生什么？

简单的的解释：

在`std::thread`的析构函数中：

```cpp
~thread() noexcept {
    if (joinable()) {
        _STD terminate();
    }
}
```

调用`join`或`detach`会把`thread`对象的`joinable`置为`false`。如果都不调用，线程在析构的时候就会调用`terminate()`从而使得程序退出。

**更深层的分析见链接**：[C++ 在声明一个线程之后不写 join() 函数或者 detach() 函数，程序就会报错，这是为什么呢？](https://www.zhihu.com/question/466912025/answer/1959682434)

## 线程抛出异常无法被常规的`try-catch`捕获

参考链接：https://murphypei.github.io/blog/2017/08/cpp11-multithread.html

```cpp
try
{
    std::thread t1(Func);
    std::thread t2(Func);

    t1.join();
    t2.join();
}
catch(const std::exception& ex)
{
    std::cout << ex.what() << std::endl;
}
```

需要在线程内捕获并保存在一个可以之后访问的结构内

```cpp
std::mutex                       g_mutex;
std::vector<std::exception_ptr>  g_exceptions; // 放捕获的异常

void throw_function()
{
   throw std::exception("something wrong happened");
}
void func()
{
   try
   {
      throw_function();
   }
   catch(...)
   {
    // 保证每次只能有一个线程写入异常消息
      std::lock_guard<std::mutex> lock(g_mutex);
      g_exceptions.push_back(std::current_exception());
   }
}

int main()
{
   g_exceptions.clear();

   std::thread t(func);
   t.join();

   for(auto& e : g_exceptions)
   {
      try 
      {
         if(e != nullptr)
         {
            std::rethrow_exception(e);
         }
      }
      catch(const std::exception& e)
      {
         std::cout << e.what() << std::endl;
      }
   }

   return 0;
}
```
