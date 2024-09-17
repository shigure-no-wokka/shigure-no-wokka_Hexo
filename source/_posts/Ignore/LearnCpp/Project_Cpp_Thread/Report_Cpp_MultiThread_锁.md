---
title: Cpp 多线程：锁
date: 2024-04-14 19:56:10
description: C++ 多线程
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_code.jpg
categories: Code
tags:
  - 多线程
  - Cpp
---

`std::thread`
- 为什么删除拷贝构造函数
- 线程本质是函数，对函数进行拷贝构造没有意义

 `std::this_thread::get_id()` 拿到线程的标识符

`std::mutex`
- 原子的
- 获取不到 lock 的线程被阻塞等待
- 通过操作系统的 API 来实现的，所以就可能牵扯到系统调用，内核态和用户态之间的切换，影响性能
- 真正的锁，拿不到 lock 的线程几乎不占用 CPU 时间
- 需要考虑到两个线程是否会频繁竞争某个资源
	- 如果不会频繁竞争，使用 mutex 是可以的
	- 但有时候如果需要频繁竞争，例如消息队列（FIFO），假如是生产者消费者模式，那么就需要频繁的进行上锁和解锁，非常影响性能
	- 由此衍生出需求，**设计一个用户态的锁**

使用方式：

```cpp
std::vector<int> g_vector;
volatile bool flag = false;
std::mutex g_mutex;
void AddToGVector()
{
	while(!flag){}
	g_mutex.lock();
	g_vector.emplace_back(0);
	g_mutex.unlock();
}
```


`std::try_lock()`
- 非阻塞版本
- 立即返回是否能够拿到 lock
- 所以一般与 `while` 配合作为自旋锁

自定义一个自旋锁

```cpp
std::atomic_flag flag = ATOMIC_FLAG_INIT; // 用来实现用户态的原子锁
bool Resource = false;
bool TestAndSet()
{
	if(!Resource)
	{
		bool LastValue = Resource;
		Resource = true;
		return LastValue;
	}
	return true;
}
void Lock()
{
	while(TestAndSet())
	{
		
	}
}
void Unlock()
{
	Resource = false;
}
```

- 问题：如何保证 `TestAndSet()` 是原子的，不会被打断
- `std::atomic_flag flag = ATOMIC_FLAG_INIT`
- `while(flag.test_and_set())`，这里的 `test_and_set()` 是原子的

然后就可以对上述内容进行包装，`class SpanLock`

```cpp
class SimpleSpanLock
{
private:
	std::atomic_flag flag = ATOMIC_FLAG_INIT;
public:
	void Lock()
	{
		while(flag.test_and_set())
		{}
	}
	void Unlock()
	{
		flag.clear();
	}
};
```


接下来思考这么一个事情，

```cpp
SimpleSpanLock SpanLock;
volatile bool start = false;
volatile int GID = 0;
void AddToGVector()
{
	while(!start) {}
	SpanLock.Lock();
	GID++;
	SpanLock.Unlock();
}

int main()
{
	SpanLock.Lock();
	SpanLock.Lock();
	SpanLock.Unlock();
	SpanLock.Unlock();
}
```

运行后，线程会卡在第二个 Lock 那里

这里可以引入 `std::recursive_mutex g_recursive_mutex`，实现同一个线程中上锁多次，并相应解锁对应次数

这种情况是为了避免，当函数内出现复杂的代码逻辑时，很可能在递归调用的其他函数内部同样需要上锁，如果不这么针对性进行上锁，会导致函数在递归过程中被阻塞住

再引申问题：如果在解锁之前，抛出异常呢？解锁的语句就无法执行，导致没有正常解锁。

```cpp
void AddToGVector()
{
	while(!start){}
	SpanLock.Lock();
	if(Resource)
	{
		Throw(); // 如果解锁之前抛出了异常
		SpanLock.Unlock();
		return ;
	}
	GID++;
	SpanLock.Unlock();
}
```

- 可以使用 `std::lock_guard<std::mutex> g1(g_mutex)`
- 从而实现了在 g 1 对象析构的时候自动调用 unlock，避免了上边那种情况

作业：
- 实现一个自旋锁
- 给自旋锁实现类似 lock_guard 的作用
