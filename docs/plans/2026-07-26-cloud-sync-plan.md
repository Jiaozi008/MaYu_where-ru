# v2.0 跨手机实时数据同步 (Cloud Sync) 实施计划

> **Goal**: 接入 Supabase / LeanCloud 免费 Serverless 数据库，实现不同手机发局、拼局、上车与名片信用的全网实时互通。

---

## Task Breakdown

### Task 1: 云端数据库配置与环境准备
- [ ] 注册免费 Supabase / LeanCloud 项目，创建 `rooms` 与 `users` 数据库表。
- [ ] 在项目中新建配置文件 `js/config.js`，保存 AppKey 与 API Endpoint（并设置允许匿名读取/发局权限）。

### Task 2: 编写云端数据驱动模块 `js/cloudStore.js`
- [ ] 实现 `fetchRooms()`: 从云端获取近 24 小时同城全部有效拼牌局。
- [ ] 实现 `createRoom(room)`: 将新局同步写入云端 `rooms` 表。
- [ ] 实现 `joinRoom(roomId, user)`: 跨手机加局原子操作。
- [ ] 实现 `leaveRoom(roomId, userId)`: 跨手机退车释放席位操作。
- [ ] 实现 `syncUser(user)`: 用户名牌与履约信用云端保存。

### Task 3: 适配大厅与房间卡片异步交互 (`js/hall.js`)
- [ ] 将大厅卡片渲染改造为支持异步 Promise。
- [ ] 在 `Hall.init()` 中增加 5s 定时器静默刷新，拉取全网最新车况。
- [ ] 当其他麻友在线上车时，实时刷新大厅卡片与海报。

### Task 4: 跨手机测试与验证
- [ ] 测试场景 1：手机 A 发局，手机 B 立即打开页面查看大厅是否有 A 发的局。
- [ ] 测试场景 2：手机 B 点击上车，手机 A 页面自动刷新显示 B 的头像与昵称。
- [ ] 测试场景 3：手机 B 点击退车，席位瞬间恢复为“虚位以待”。

---

## 验证与验收指标
- 跨设备发局延迟 < 2 秒。
- 无网时自动保底加载 LocalStorage，不影响静态功能。
