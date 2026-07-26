# 跨手机实时数据同步 (Cloud Sync) 架构设计

> 日期：2026-07-26  
> 目标：解决单机 LocalStorage 模式下“A 手机发局，B 手机大厅看不到；B 上车，A 车况不更新”的问题，实现真正的跨设备同城多人实时拼局。

---

## 1. 背景与核心问题

目前 H5 运行在客户端浏览器的 `LocalStorage` 环境中：
- **优点**：零服务器成本、无需数据库、开发极其迅速、UI/交互已 100% 验证。
- **瓶颈**：数据物理隔离在各自手机内部。A 在自己的手机微信发局，B 在另一台手机上打开 `mayu-where-ru.pages.dev` 无法看到 A 发的局；B 无法在自己手机上为 A 的局点击“上车”。

---

## 2. 架构设计原则

1. **零自建服务器**：维持极简创业原则，不自建 Node.js/Python 服务端，不引入昂贵的服务器运维成本。
2. ** Serverless 免费云数据库**：采用成熟的 Serverless 数据库 REST API 方案（优先选择 **Supabase** 或 **LeanCloud** 免费版）。
3. **前端纯原生 SDK / Fetch 接入**：在现有的原生 JavaScript (ESM) 架构下，直接使用原生 `fetch()` 请求云端 REST API。
4. **LocalStorage 离线保底**：网络不佳或云端未配置时，自动静默降级为本地 LocalStorage，确保系统永远不会抛错或黑屏。

---

## 3. 云端数据表结构设计 (Database Schemas)

### 表 1：`rooms` (公开拼牌局数据表)

| 字段名 | 类型 | 说明 |
| :--- | :--- | :--- |
| `id` | VARCHAR(64) PRIMARY KEY | 房间唯一标识 (如 `room_1721980000000`) |
| `title` | VARCHAR(128) | 局名与规则 (如 `【广东鸡平胡】20分底·急缺2人`) |
| `city` | VARCHAR(64) | 城市 (如 `湛江市`) |
| `district` | VARCHAR(64) | 区县 (如 `赤坎区`) |
| `area` | VARCHAR(64) | 商圈 (如 `海田商圈`) |
| `address` | TEXT | 详细地点门牌 (如 `胖子棋牌室 6号包厢`) |
| `rule_tag` | VARCHAR(64) | 玩法品类 |
| `wechat_group_qr` | TEXT | 局长微信群二维码 Base64 / 图片 URL |
| `host_info` | JSONB | 局长主客体数据 `{id, name, avatar, creditRate, isGold, wechat, phone}` |
| `players` | JSONB | 当前已上车玩家数组 `[{name, avatar, wechat, phone}, ...]` |
| `max_players` | INT | 最大席位数 (默认 4) |
| `start_time` | VARCHAR(64) | 开局时间段 (如 `今天 (07-26) 19:00-23:00`) |
| `status` | VARCHAR(32) | 状态 (`MATCHING` / `FULL` / `FINISHED` / `CANCELLED`) |
| `created_at` | TIMESTAMPTZ | 创建时间 |

### 表 2：`users` (麻友信用与名片表)

| 字段名 | 类型 | 说明 |
| :--- | :--- | :--- |
| `id` | VARCHAR(64) PRIMARY KEY | 用户设备唯一 ID |
| `name` | VARCHAR(64) | 麻友昵称 |
| `avatar` | TEXT | 头像 URL |
| `wechat` | VARCHAR(64) | 微信号 |
| `phone` | VARCHAR(32) | 手机号 |
| `fulfilled_count` | INT | 守时履约成功次数 |
| `flake_count` | INT | 放鸽子被标记次数 |
| `is_banned` | BOOLEAN | 是否处于封禁状态 |

---

## 4. 实时同步与广播机制 (Real-time Sync)

1. **自动轮询 / 静默刷新 (Polling)**：
   - 大厅页面开启 5 秒一次的静默增量拉取 (`fetchRoomsFromCloud`)。当湛江有任何新发局或名额变动，所有打开大厅的手机在 5 秒内自动更新看板。
2. **操作即时同步 (Action Push)**：
   - 局长发布新局 ➔ 提交到云端 `rooms` 表 ➔ 触发全局拉取；
   - 麻友 B 点击“上车” ➔ 云端原子更新该局 `players` 字段 ➔ 局长 A 手机车况瞬间从 `1/4` 变为 `2/4`；
   - 麻友 B 点击“退车” ➔ 云端移除 B 并重新释放席位。

---

## 5. 计划实施步骤概览

* **Phase 1**：注册免费 Supabase / LeanCloud 项目并获取公开 Key。
* **Phase 2**：在 `js/` 目录下创建 `cloudStore.js` 统一封装 Fetch REST 请求。
* **Phase 3**：重构 `js/hall.js` 与 `js/store.js`，将异步获取与云端同步平滑无缝接入。
