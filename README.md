# 声笔飞单部首肌肉记忆训练

程序集成了著名的 [SuperMemo](https://supermemo.guru/wiki/SuperMemo) 记忆算法，能够有效的帮助用户快速且牢固的记忆声笔飞系的部首所在按键。

## 快速入门

1. 跟据卡牌中显示的部首，按下对应的按键
2. 持续进行训练，直到达到满意的速度

## 程序介绍

在（重新）开始训练时程序会将一个个的部首和对应的按键制作成一张张的卡牌，顺序是随机的。卡牌的正面是部首，背面是你需要输入的对应按键。在卡牌显示后，你要以最快的速度按下键盘上相应的按键。如果按键正确，则会自动显示下一张卡牌，且程序会根据你的响应时间来为你的记忆评级。

- 如果在 600ms 以内，则认为是非常好的成绩，即 5 级
- 如果在 1s 以内，则认为是不错的成绩，即 4 级
- 只要能一次输入正确，即为 3 级
- 错 1 次 2 级
- 错 2 次 1 级
- 错 3 次及以上为 0 级，按键错误 3 次以上时会显示该部首对应的按键，你需要按下该按键才能继续训练。

程序会根据这个评级来安排该卡牌下次出现的时间，以便巩固你的记忆。

程序会在退出（关闭页面、刷新页面、关闭浏览器等）时自动将当前进度记录到浏览器的本地存储当中；当下载再次打开时，会自动尝试从本地存储中加载进度。**这个存储是存储在本地的，所以换了浏览器之后就需要重来了**


## 版本历史

### 1.0.3

- 【解决】解决切换是否显示按键提示时会切换显示主题的问题
- 【增加】待训练数量提示
- 【增加】删除确认，防止误操作
- 【优化】记忆算法，600ms - 5级，1s - 4 级，一次性输入正确 - 3 级，错1次- 2级，错2次 - 1级，错3次及以上 - 0级，错3次时自动提示按键，输入错误的会作为本次训练任务自动排到待训练队尾
- 【调整】调整任务完成提示，提示下一次训练时间
- 【调整】取消空格键开始训练，页面加载后直接开始

### 1.0.2

- 【解决】双击图标会变成选中状态问题
- 【增加】首页链接
- 【优化】移动端体验
- 【调整】桌面端菜单栏恢复到右侧
- 【调整】部首颜色换成了蓝色
- 【取消】“保存”和“加载”按纽

### 1.0.1

- 适配手机端

### 1.0.0

- 初始版本


## 依赖项目

- [SM-15](https://github.com/slaypni/SM-15)
- [Element Plus](https://element-plus.gitee.io)
- [Fontello](https://fontello.com)