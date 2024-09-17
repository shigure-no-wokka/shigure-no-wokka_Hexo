---
title: Cpp 关键字：mutable
date: 2024-05-08 08:29
description: 
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_code.jpg
categories: Code
tags:
  - Cpp
  - 关键字
---

`mutable` 用于描述 C++ 的某个具有 const 属性的类中的成员数据是否可以修改

举例：

```cpp
class Record
{
	public:
		float SetAndGetValue(float NewValue) const
		{
			LastValue = CurrentValue;
			CurrentValue = NewValue;
			return LastValue;
		}
		void PrintMember() const
		{
			std::cout << "LastValue: " << LastValue << std::endl;
			std::cout << "CurrentValue: " << CurrentValue << std::endl;
		}
	private:
		mutable float LastValue = -1;
		mutable float CurrentValue = 0;
};

int main()
{
	const Record TempRecord;
	TempRecord.SetAndGetValue(2);
	TempRecord.PrintMember();
	
	return 0;
}
```

上边代码中声明了一个 `Record` 类，其内部有两个 const 函数，由于这里将两个成员变量设置为了 `mutable` 所以能够在内部修改。在主函数中，声明了一个 const Record，对于 `mutable` 变量的修改正常

也可以在外部修改被 `mutable` 修饰的成员变量，就算就这个类也是 const

```cpp
class Record
{
public:
	Record(){ x=20; y=24; }
	int x = 2;
	mutable int y = 4;
};

int main()
{
	const Record TempRecord;
	TempRecord.y = -1;
	std::cout << TempRecord.y << std::endl; // -1
	TempRecord.x = -24; // 出错，不能给常量赋值
}
```

注：一个具有 `const` 属性的类应当尽可能不用 `mutable` 修饰，因为这意味着这个类的设计在逻辑上存在缺陷

# 参考链接
- [C++ 中的 mutable 关键字 | 始终](https://liam.page/2017/05/25/the-mutable-keyword-in-Cxx/)
