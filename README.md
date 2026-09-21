# trae-checkin-reset

重置 Trae CN（国内版 IDE）「每日签到积分弹窗」的**本地展示频控**。当你打开 Trae 后签到提醒弹窗连续几天不再出现、又想让它重新具备弹出资格时，运行它即可。

> 非官方第三方小工具，与 Trae / 北京引力弹弓科技无任何关联，MIT 许可、风险自负。

## 这是什么机制？（逆向自有版本的安装包）

通过分析本机 Trae 安装目录中的代码（`workbench.desktop.main.js`、`@byted-solo/commercial-config-sdk`、`@byted-icube/desktop-modules`），签到弹窗的触发链是：

1. **服务端商业配置下发**：弹窗配置（场景 `ide.bannerPopup`、渲染器 `daily_checkin`）由服务端远程下发，不是客户端写死的；
2. **展示位置受限**：弹窗挂在 AI 面板右上角（`placement: ai-panel-top-right`），不打开 AI 聊天面板时没有展示机会；
3. **状态接口闸**：`/trae/api/v2/ug/checkin_credits/status` 必须返回 `enable=true`、未签到、无业务错误（例如「该设备今日已参与签到」）；
4. **本地频控闸**：弹窗一旦展示后被关闭或倒计时自动消失，SDK 就会在本地状态库写入一条记录（策略包括 `once / daily / limited / cooldown / forever`，以及 `maxCount`、`windowDays` 等限制）。多设备同账号还存在 owner 抑制。

频控记录保存在：

```
%APPDATA%\Trae CN\User\globalStorage\state.vscdb (SQLite)
```

键形如：

```
commercial-banner-popup:commercial:ide.bannerPopup:credits.dailyCheckIn.ideBanner:user:<你的UID>
```

## 脚本做了什么

- 只删除本地状态库中键名**包含 `dailyCheckIn`** 的签到弹窗频控记录（就是上面那一类键）；
- 删除前自动把 `state.vscdb`（含 `-wal`/`-shm`）备份到脚本目录的 `backup/` 下，文件名带时间戳；
- 检测到 Trae CN 仍在运行时**直接中止**（数据库被占用时写入会失败/被覆盖）；
- **完全离线运行**，不访问网络，不触碰账号、登录态、积分与任何云端数据。

注意：重置只解决「本地频控」这一道闸。若服务端当天未给你下发活动、你今天已在任何设备签到、或 AI 面板没有打开，弹窗依然不会出现，这属于正常现象。

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

删除前的数据库备份位于 `backup\state.vscdb.<时间戳>.bak`。先完全退出 Trae CN，再用备份文件覆盖回：

```
%APPDATA%\Trae CN\User\globalStorage\state.vscdb
```

## 环境要求

- Windows（路径与进程检测基于 Windows，仅针对 **Trae CN 国内版**）
- Node.js >= 22.5（用到内置 `node:sqlite`；Node 22 下脚本会自动以 `--experimental-sqlite` 重新拉起）

## License

[MIT](LICENSE)
