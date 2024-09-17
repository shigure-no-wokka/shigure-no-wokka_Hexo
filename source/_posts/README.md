# Ascend

> [!IMPORTANT]
> 青灯孤照, 无限无动, 藏有珍本, 默默无闻, 无用而不败坏

唯一项目管理表 -> [GoogleSheet_Ascend](https://docs.google.com/spreadsheets/d/1EKr4grSkc-EZaRgNwRUFpyI_yDsXGRq7KCd3_dzWV_I/edit?gid=203427550#gid=203427550)

本仓库为个人发展管理与规划系统，各种思考、学习、实践等记录都会在这里留存，部分内容会发布到博客上


**两个最重要的部分:**
- Rule No.1 到点下班
- Rule No.2 长期主义

**几个可参考的开发原则:**
- DRY = Do not Repeat Yourself
- KISS = Keep It Simple and Stupid
- GTD = Get Things Done
- Done is better than perfect

**保持成长:**
- 大量阅读, 动手实践, 总结笔记, 输出文章
- 根据[游戏程序员的成长之路](https://github.com/miloyip/game-programmer)定制的自己的成长路径 -> [游戏开发之路: 个人成长规划](../Project_GameDev_Self/Report_GameDev_Self.md)


---

# 时间安排

## 作息规范

- 规定：
    - 周一到周六为个人的学习与开发的时间
    - 周末为本周总结，资料整理与安排行程的时间
- 固定休息时间：7.5h~8h 睡眠时间
    - 早上 8 点 30 起床
    - 晚上 0 点 30 睡觉
- 通勤时间：1h
    - 游戏设计或开发等方面的视频或音频（需要周日从资料表中确定）
- 工作时间（非工作日参考工作时间进行个人开发）：
    - 上午：9 点 30 到 12 点
    - 中午：不午休
    - 下午：12 点到 18 点 30
- 固定开发时间：每日晚上 21 点到 24 点（工作日最晚到 23 点）


## 周期规范

- 使用软件：**专注清单**
- 任务名设置参照[命名规范中的项目文件夹命名](README.md#命名规范)
- 规定一个学习周期为 30min，其中*番茄钟*为 25min，*短时休息*为 5min。四个番茄钟后进行*长时休息*，时间为 15min
    - **番茄钟**：珍惜任务时间
    - **短时休息**：补充水分（250ml），闭眼休息，冥想学习内容
    - **长时休息**：起立行走 1 分钟（原地也可，但要求膝盖高度），补充水分（250ml），洗脸清醒，闭眼休息，冥想学习内容


---

# 任务规范

## 资料收集规范

>[!IMPORTANT]
>如果在非周末时间找到新资料，需要先将新资料添加到 [Ascend 中的待分类表格中](https://docs.google.com/spreadsheets/d/1EKr4grSkc-EZaRgNwRUFpyI_yDsXGRq7KCd3_dzWV_I/edit?gid=1152965485#gid=1152965485)
>待本周末再进行细分


## 层级规范

- **范畴（Category）**：逐层递进
    - **Code**，编程知识：代码基础、数据结构与算法基础
    - **Dev**，开发知识：技术栈、开发工具、系统设计等
    - **Engine**，引擎知识：游戏引擎知识、引擎的教程
    - 等
    - **Frag**，片段的，杂项知识：语言、写作、哲学等
- **领域（Aspect）**
    - 所属范畴之中的细分类型，以 Learn 开头，比如 Code 之下的 LearnCpp 和 LearnLua，Engine 之下的 LearnUE 和 LearnUnity
    - 太长的单词可以简写，但一定是业界公认的缩写，比如 UE，不能自行创造简写
- **主题（Theme）**：领域之下的细分类型，比如设计模式之中的观察者模式，UE 中的 AnimationSystem
- **子主题 (SubTheme)**: (可选) 当主题需要进一步细分时使用
- **标签（Tag）** 
    - *标签全部使用英文*
    - 标签只允许一个单词或简短的词组，比如 UnrealEngine
    - 标签一般不允许简写，比如 UE，比如写成 UnrealEngine
    - 部分常用的公认缩写可以，比如 MVVM
    - 标签不允许过于细致的分类，一般来说使用*范畴*、*领域*和*主题*即可，如有特殊的作用、功能或目的性也可以加上


## 发布任务规范

> [!IMPORTANT]
> 任务需要提交到 [AscendTable](https://docs.google.com/spreadsheets/d/1EKr4grSkc-EZaRgNwRUFpyI_yDsXGRq7KCd3_dzWV_I/edit?gid=203427550#gid=203427550)

- **星级**：对资料的内容质量的评价
    - <font color="#e6cff2">顶级</font>：内容质量足以单开一个`Report_`
    - <font color="#bfe1f6">重要</font>：多个同主题的作为一个`Report_`
    - <font color="#d4edbc">很好</font>：在上级星级中进行补充
    - <font color="#e6e6e6">一般</font>：在备注中写摘要即可
- **状态**：
    - <font color="#11734b">已完成</font>：阅读完毕，或完成输出笔记并发布到个人网站
    - <font color="#0a53a8">输出中</font>：阅读完毕，开始整理输出笔记
    - <font color="#473822">进行中</font>：到了开始时间，并在进行中
    - <font color="#5a3286">预定</font>：规定开始时间，但还未开始进行
    - <font color="#e8eaed">待定</font>：未规定开始时间
- **记录日期**：收集到该资料的日期
- **完成**：完成的部分
- **总计**：资料的全部数额
- **进度**：完成百分比
- **输出日期**：开始撰写输出笔记的日期
- **是否发布**：
    - <font color="#d4edbc">已发布</font>：输出笔记发布到个人网站
    - <font color="#bfe1f6">待发布</font>：输出笔记在进行中，未发布待个人网站
    - <font color="#e8eaed">未发布</font>：未开始输出笔记
    - <font color="#ffcfc9">不发布</font>：不整理输出笔记
- **备注**
    - 阅读前，预计要搞清楚的问题
    - 阅读后，还需要搞清楚的问题
    - <font color="#e6e6e6">一般</font>资料的摘要笔记


---

# 报告规范

## 命名规范

- **报告内容需要严格遵守主题**
- 文件和文件夹的命名统一使用英文
- 命名中的单词之间使用下划线`\_`连接
- 每一个 `Category` 下可以自行细分为 `Learn{SpecificCategory}`, 比如 UE 引擎可以分类放到 ` LearnUE ` 下
- **项目文件夹**: 统一使用 `Project_` 为前缀
	- 命名格式：`Project_{SpecificCategory}_{Aspect}_{Theme}`
- **报告文件**: 统一使用 `Report_` 为前缀
	- 命名格式：`Report_{Theme}_{PartNum}_{SubTheme}`


## 摘要规范

> [!IMPORTANT] 
> **绝对不允许照抄资料内容**

摘要需要使用 **[首页 - boardmix](https://boardmix.cn/app/home)** 按照**主题**创建文件 (参考[命名规范](README.md#命名规范)); 内部以*选区*进行区分 (参考[命名规范](README.md#命名规范))

主要分为以下步骤：
- 整理资料大纲
- 确定主题与子主题
- 规划输出文档目录
- 撰写输出文档内容

> [!NOTE] 
> 在网页上阅读文章、在 ipad 上阅读书籍时的标注颜色

- 概念类：<font color="#E57373">红色标注</font>
- 描述类：<font color="#81C784">绿色标注</font>
- 对比类：<font color="#64B5F6">蓝色标注</font>


## 内容规范

撰写任务报告需要使用 **VSCode** 进行撰写

- **主题**内容量过小，也要单独设置`Report`
- **主题**内容量过大，需要考虑按照子主题将内容拆分为多个`Report`，命名后缀增加：`{Number}_{PartName}`，顺序编号和拆分主题
- 文件开头需要设置 YAML，利用 Obsidian 的模板插入对应的格式，所有 YAML 属性都要填充完毕
- **`Report`内容需要紧扣主题**

> [!TIP]
> 如果同一主题下有多个参考资料，需要对全部资料进行分析与整理，确定是否可以细分主题`{PartName}`，最后给出自己在对应主题下的`Report`


---

# 文档规范

## 开发文档规范

- 开发相应项目之前需要确定项目需要开发的目标与执行规范

> [!IMPORTANT]
> 项目开发规范

- **项目概述**
    - 这个项目是什么？
    - 为什么要做这个项目？
    - 怎么去实现这个项目？
- **模块设计**
    - 能划分为几个模块？
    - 每个模块负责什么功能？
    - 模块之间如何通信？
    - 如何协调不同模块？
- **估期预计**
    - 大致给出不同模块开发的预计时间


## 项目文档规范

- 创建项目仓库时[参照文件命名](README.md#命名规范)
- 添加：`README.md`文件，目的是介绍项目，内容简洁，突出重点

> [!IMPORTANT]
> 项目 README 规范

- **项目概述**
    - 项目背景和目标：介绍开发的目的和初衷，提供一个前期的完成目标
    - 系统功能概述：介绍开发的功能，配上相关的展示
- **项目进度**
    - <font color="#64B5F6">预计实现</font>：预定要实现的模块或功能
    - <font color="#81C784">已经实现</font>：如果有可展示内容则链接到内容
    - <font color="#E57373">存在问题</font>：相关问题链接到具体的**遗留问题**
- **关键技术**
    - 以攀爬系统为例：
    - ControlRig 和 IK 实现手脚与墙面的自适应
    - MotionWarping 的使用：如何处理角色运动时的根运动的位置匹配的
- **优化部分**
    - 同样以攀爬系统为例：
    - 多样化场景适配：系统在不同材质和不同形状的墙壁下的适配性
    - 多样化的动画库：丰富攀爬动画，支持多种攀爬状态之间的过渡等
    - 与其他系统的整合：展示系统之间的交互
- **遗留问题**
    - 列举所有发现的问题和相应的解决方案，如果未能解决，就给出一个想法
- **项目开发记录**
    - 记录项目各模块开发的思路、问题、解决方案等


---

# 项目规范

## UE 项目结构规范

UE 项目结构：
- **Project_UE_XXX**
    - Assets: 项目文档所需要的资源，一般是图片
    - Config
    - *Content*: 蓝图 + unlua + 资源
	    - *_XXX*: 单独创建一个文件夹，在其之下存放项目所需要的文件
	        - *Blueprints*
	        - *Data*：DataTable、全局定义的结构体和枚举值
	        - *Maps*：全部的地图
	        - *Script*：UnLua 的文件，文件夹分类参考 Blueprints
    - Other
    - **README.md**: 项目文档

其中的蓝图文件夹结构：
- *Actors*: 一般是不涉及到骨骼网格体的全部 Actor
- *AI*: 行为树、黑板、AIController、Task 等
- *Characters*：涉及到骨骼网格体的全部 Actor，内部按照具体的角色类型 (如：人形，主要目的是区分一些可能公用的资源) 划分文件夹
	-  *Character 01*
		- *Animations*: 本类型角色使用到的动画资源 (注意是否存在通用资源)
		- BP_Character 01
	- *Character 02*
- *Components*
- *Input*
- *Interfaces*：所有接口，内部还需要细分
- *Materials*
- *Settings*：GameMode、GameState、PlayerState、PlayerController 等
- *Subsystem*：比如 GAS、Lyra
- *UI*


## 网站发布规范

- 不准备发布的内容放在 `Ignore` 文件夹
- 仓库 `Ascend` 和个人网站一并维护

