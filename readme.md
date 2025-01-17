## 企业微信打卡

该脚本用于 Hamibot，auto.js 未测试,安卓系统最低要求 7.0

https://github.com/hlsky1988/WeChatCheckingIn

### 使用要求

- 安卓系统最低要求 7.0
- Hamibot 后台保活并联网,WiFi 设置锁屏不断开网络
- 手机取消指纹和密码,原因是仅做了点亮屏幕后的滑屏解锁

### 脚本配置说明

- 是否开启上班快捷打卡,默认 否,开启能够提高打卡成功率
  - 该功能为测试功能(打卡后的状态监测)
- 每一步操作的时间间隔,单位 ms,默认 1000,视机型调整
- ServerChan 消息推送地址,为空则表示不发送
- Bark 消息推送地址,为空则表示不发送

### 关于快捷打卡

- 什么是快捷打卡: 符合打卡条件的情况下,打开企业微信会自动打卡
- 如何设置: 工作台 - 打卡 - 右上角菜单 - 打卡设置
- 如果愿意,可以开启上班快捷打卡,脚本运行配置务必正确,建议关闭下班快捷打卡

### 测试通过机型:

| 测试机型    | 系统版本        | 安卓版本 | 企业微信版本 |
| ----------- | --------------- | -------- | ------------ |
| 华为 mate30 | EMUI 11.0.0.165 | 10       | 3.1.1(14025) |
| 魅蓝 note3  | Flyme 6.3.5.0A  | 7        | 3.1.1(14025) |

### 已知问题

1. 在更换设备打卡时，会被检测到并提示非常用设备打卡，此时需要拍照或者验证同事手机号码才能打卡，验证一两次之后就可以了（上次换手机的经验）
1. 在某些老机型上使用 hamibot.postMessage 回传消息会让脚本启动很慢, 在 魅蓝 note3 上可能会长达 30 秒, 可以考虑换备用机了

### 打卡状态的通知消息收不到

- 目前采用的是 ServerChan 的消息通知
- 当前(2021 年 1 月 28 日)因为某些抢茅台脚本导致 ServerChan 的服务波动,详情看 微信公众号 [方糖历史消息](https://mp.weixin.qq.com/s/gNMgRO863IfbNl6oZ1w8AA)
- 当通知消息发送失败时会重发,连续 3 次发送失败则结束脚本,这时候只能查看日志了

### 更新日志

- 2021.07.05.194 修改了消息回传
- 1.0.2 添加 hamibot.postMessage 回传消息
- 1.0.1 添加脚本运行完成后结束(退出)当前脚本
- 1.0.0 添加了 Bark 的消息通知
- 0.0.4 添加了早退打卡的判断和通知消息发送失败的处理
- 0.0.3 添加了唤醒解锁手机、每一步操作的时间间隔设置和上班快捷打卡设置,修复了 5.5 寸手机可能会出现的打卡异常
- 0.0.2 重写了打卡逻辑,添加了 ServerChan 的消息通知
- 0.0.1 简单粗暴第一版,只能实现打卡,状态判断和消息通知待实现
