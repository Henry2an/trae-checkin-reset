# trae-checkin-reset

重置 Trae CN（国内版 IDE）「每日签到积分弹窗」的**本地展示频控**。当你打开 Trae 后签到提醒弹窗连续几天不再出现、又想让它重新具备弹出资格时，运行它即可。

> 非官方第三方小工具，与 Trae / 北京引力弹弓科技有限公司无任何关联。Trae 为北京引力弹弓科技有限公司的商标。MIT 许可、风险自负。

## 弹窗机制（基于对本地安装文件的分析）

签到弹窗能否出现，由两件事共同决定：**服务端远程配置**（当天是否给你的账号下发签到活动、弹窗挂在 AI 面板内）和**本机展示频控**（弹窗展示并关闭后，会在本地状态库记录一次，之后按策略不再重复弹出）。

频控记录保存在：

```
%APPDATA%\Trae CN\User\globalStorage\state.vscdb (SQLite)
```

键形如：

```
commercial-banner-popup:commercial:ide.bannerPopup:credits.dailyCheckIn.ideBanner:user:<你的UID>
```

本工具只清除「本机展示频控」这一道闸。因此重置后若仍不弹窗，可能是服务端当天未下发活动、你今天已在其他设备签到、或 AI 面板没有打开，这些都属于正常现象，并非工具失效。

## 脚本做了什么

- 只删除本地状态库中键名**包含 `dailyCheckIn`** 的签到弹窗频控记录（就是上面那一类键）；
- 删除前自动把 `state.vscdb`（含 `-wal`/`-shm`）备份到脚本目录的 `backup/` 下，文件名带时间戳；
- 检测到 Trae CN 仍在运行时**直接中止**（数据库被占用时写入会失败/被覆盖）；
- **完全离线运行**，不访问网络，不触碰账号、登录态、积分与任何云端数据。

## 使用方法

1. 完全退出 Trae CN（菜单「文件 → 退出」，右下角托盘图标也要退出）；
2. 确认已安装 [Node.js](https://nodejs.org/) **>= 22.5**；
3. 双击 `reset-checkin-banner.cmd`，按提示操作；
4. 重新打开 Trae CN，并点开 AI 聊天面板，签到弹窗将重新具备弹出资格。

也可以命令行直接运行：

```bat
node reset_checkin_banner.js
```

## 不想等弹窗？直接手动签到

弹窗本来就不是唯一入口。在 Trae 中点击左下角 **头像 → 签到**，即可直接领取（官方说明：免费用户每日签到可得通用积分，有效期 31 个自然日）。若提示「该设备今日已参与签到」或入口缺失，属账号/设备维度的服务端限制，请联系官方客服 `feedback@mail.trae.cn` 处理。

## 如何还原

删除前的数据库备份位于 `backup\` 目录，文件名带时间戳，可能包含 `state.vscdb.<时间戳>.bak` 以及（若当时存在）`state.vscdb-wal.<时间戳>.bak`、`state.vscdb-shm.<时间戳>.bak`。

先完全退出 Trae CN，再把**同一时间戳下实际存在的备份文件**覆盖回原位置（去掉文件名中的时间戳部分）：

```
%APPDATA%\Trae CN\User\globalStorage\state.vscdb
%APPDATA%\Trae CN\User\globalStorage\state.vscdb-wal
%APPDATA%\Trae CN\User\globalStorage\state.vscdb-shm
```

## 环境要求

- Windows（路径与进程检测基于 Windows，仅针对 **Trae CN 国内版**）
- Node.js >= 22.5（用到内置 `node:sqlite`；Node 22 下脚本会自动以 `--experimental-sqlite` 重新拉起）

## License

[MIT](LICENSE)
