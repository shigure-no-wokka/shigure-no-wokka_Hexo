---
title: UE 基础：联网及多人游戏
date: 2024-05-03 17:28:02
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_engine.jpg
categories: 软件知识
tags:
  - UE
---


- Replicate：用于向 Client 同步以 Server 端为 Authority 的属性，允许设置相关回调函数
- RPC：用于 Client 向 Server 通知本地操作申请
- NetMulticast：用于 Server 通知各 Client 执行指定操作


# 参考链接

- [UE4 属性同步（四）rpc 实现](https://zhuanlan.zhihu.com/p/597348618)
- 官方文档：
  - [Actor 的复制](https://docs.unrealengine.com/4.27/zh-CN/InteractiveExperiences/Networking/Actors/)
    - [Actor 及其所属连接](https://docs.unrealengine.com/4.27/zh-CN/InteractiveExperiences/Networking/Actors/OwningConnections/)
    - [RPC](https://docs.unrealengine.com/4.27/zh-CN/InteractiveExperiences/Networking/Actors/RPCs/)