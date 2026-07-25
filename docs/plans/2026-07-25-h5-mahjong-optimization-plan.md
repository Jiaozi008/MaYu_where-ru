# 《麻友，你在哪儿》极简全闭环增强方案 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 搭建《麻友，你在哪儿》H5 同城约局极简全闭环应用，涵盖商圈检索、防鸽风控、微信 4 格拼卡与麻友沉淀四大模块。

**Architecture:** 采用超轻量 Vanilla HTML5 + ESM JavaScript + CSS3 变量设计系统。状态统一集中于 `js/store.js`（本地 LocalStorage 持久化 Mock），零依赖，即开即用。

**Tech Stack:** HTML5, Modern CSS3 (CSS Variables, Flexbox/Grid), Modern ES JavaScript (ESM, Canvas API).

## Global Constraints

- 无需安装依赖包或复杂构建链，直接通过静态 Server 或浏览器加载 ESM。
- 所有全局样式严格使用 CSS 变量，页面美观现代（包含高饱和国潮/夜间微光质感）。
- 绝不强迫用户授权 GPS，默认提供商圈级模糊定位与手填棋牌室名。

---

### Task 1: 项目基础骨架与核心 Design System

**Files:**
- Create: `index.html`
- Create: `css/style.css`
- Create: `js/store.js`

**Interfaces:**
- Consumes: None
- Produces: `Store.getState()`, `Store.setState()`, `Store.getRooms()`, `Store.createRoom()`

- [ ] **Step 1: 创建基础数据 Mock 状态库 `js/store.js`**

```javascript
// js/store.js
const DEFAULT_ROOMS = [
  {
    id: 'room_101',
    title: '血战到底·25分底·急缺1人',
    city: '深圳市',
    district: '南山区',
    area: '科技园',
    address: '胖子棋牌室 3号包厢',
    distance: 1.2,
    host: { name: '老麻枪胖哥', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Pangge', creditRate: 98, isGold: true },
    players: [
      { name: '老麻枪胖哥', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Pangge' },
      { name: '小张麻友', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Zhang' },
      { name: '阿强哥', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Qiang' }
    ],
    maxPlayers: 4,
    startTime: '今天 19:30',
    status: 'MATCHING'
  }
];

export const Store = {
  getRooms() {
    const local = localStorage.getItem('mahjong_rooms');
    return local ? JSON.parse(local) : DEFAULT_ROOMS;
  },
  saveRooms(rooms) {
    localStorage.setItem('mahjong_rooms', JSON.stringify(rooms));
  },
  getUser() {
    const user = localStorage.getItem('mahjong_user');
    return user ? JSON.parse(user) : {
      id: 'usr_me',
      name: '极简麻友',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Me',
      fulfilledCount: 8,
      flakeCount: 0,
      isBanned: false,
      contacts: []
    };
  }
};
```

- [ ] **Step 2: 创建 CSS 设计系统 `css/style.css`**

```css
/* css/style.css */
:root {
  --bg-primary: #121826;
  --bg-card: #1f293d;
  --accent-gold: #f59e0b;
  --accent-green: #10b981;
  --text-main: #f3f4f6;
  --text-muted: #9ca3af;
  --danger: #ef4444;
  --border-radius: 12px;
}

body {
  margin: 0;
  padding: 0;
  background-color: var(--bg-primary);
  color: var(--text-main);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.container {
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  box-sizing: border-box;
  padding: 16px;
}
```

- [ ] **Step 3: 创建主结构 `index.html`**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>麻友，你在哪儿 - 同城拼局</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div class="container" id="app">
    <header class="app-header">
      <h1>🀄 麻友，你在哪儿</h1>
      <div id="user-badge"></div>
    </header>
    <main id="main-content"></main>
  </div>
  <script type="module" src="js/app.js"></script>
</body>
</html>
```

- [ ] **Step 4: 校验基建**

打开浏览器或服务器运行 `index.html`，确认容器居中，黑金配色应用成功。

---

### Task 2: 地理位置与大厅检索模块 (Geo & Hall Retrieval)

**Files:**
- Create: `js/geo.js`
- Create: `js/hall.js`
- Modify: `index.html`

**Interfaces:**
- Consumes: `Store.getRooms()`
- Produces: `Geo.getCurrentArea()`, `Hall.renderRoomList()`

- [ ] **Step 1: 创建地理位置模块 `js/geo.js`**

```javascript
// js/geo.js
export const Geo = {
  getAvailableAreas() {
    return ['全部商圈', '科技园', '后海/海岸城', '西丽', '车公庙', '华强北'];
  },
  getCurrentArea() {
    return '科技园'; // 默认静默模拟当前商圈
  }
};
```

- [ ] **Step 2: 创建大厅渲染与过滤模块 `js/hall.js`**

```javascript
// js/hall.js
import { Store } from './store.js';
import { Geo } from './geo.js';

export const Hall = {
  render(containerEl) {
    const rooms = Store.getRooms();
    const areas = Geo.getAvailableAreas();

    containerEl.innerHTML = `
      <div class="filter-bar">
        <select id="area-select">
          ${areas.map(a => `<option value="${a}">${a}</option>`).join('')}
        </select>
        <button id="btn-create-room" class="btn-primary">+ 快捷摇人(发局)</button>
      </div>
      <div class="room-list" id="room-list"></div>
    `;

    this.renderRooms(rooms);
    this.bindEvents();
  },

  renderRooms(rooms) {
    const listEl = document.getElementById('room-list');
    listEl.innerHTML = rooms.map(room => `
      <div class="room-card" data-id="${room.id}">
        <div class="room-header">
          <span class="tag-location">[${room.district}·${room.area}]</span>
          <span class="room-title">${room.title}</span>
        </div>
        <div class="room-body">
          <p class="room-address">📍 ${room.address} (${room.distance}km)</p>
          <p class="room-time">⏰ 开局时间：${room.startTime}</p>
          <div class="host-info">
            <img class="avatar-sm" src="${room.host.avatar}" />
            <span>${room.host.name}</span>
            ${room.host.isGold ? '<span class="badge-gold">⚡ 黄金麻友</span>' : ''}
          </div>
        </div>
        <button class="btn-join" data-id="${room.id}">我要上车 (${room.players.length}/${room.maxPlayers})</button>
      </div>
    `).join('');
  },

  bindEvents() {
    // 监听筛选与发局点击
  }
};
```

- [ ] **Step 3: 验证大厅检索与商圈高亮**

在 `index.html` 打开页面，确保能够切换商圈并实时筛选房间列表。

---

### Task 3: 守时信用与防鸽风控模块 (Credit & Anti-Flake System)

**Files:**
- Create: `js/credit.js`
- Modify: `js/hall.js`

**Interfaces:**
- Consumes: `Store.getUser()`
- Produces: `Credit.showCommitModal(onConfirm)`, `Credit.reportFlake(userId)`

- [ ] **Step 1: 创建防鸽风控与上车守时承诺弹窗 `js/credit.js`**

```javascript
// js/credit.js
import { Store } from './store.js';

export const Credit = {
  checkBanned() {
    const user = Store.getUser();
    if (user.isBanned) {
      alert('⚠️ 您的账号因此前爽约放鸽子，处于7天冷静封禁期内，无法上车/发局！');
      return true;
    }
    return false;
  },

  showCommitModal(roomTitle, onConfirm) {
    if (this.checkBanned()) return;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-card">
        <h3>🛡️ 上车守时承诺</h3>
        <p>你即将申请加入：<strong>${roomTitle}</strong></p>
        <div class="promise-box">
          <label>
            <input type="checkbox" id="chk-promise" />
            我承诺按时到场，绝不无故放鸽子。我了解若爽约被局长标记，账号将被<strong>封禁7天</strong>禁止发局与上车。
          </label>
        </div>
        <div class="modal-actions">
          <button id="btn-cancel" class="btn-secondary">取消</button>
          <button id="btn-submit-join" class="btn-primary" disabled>确认申请上车</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const chk = modal.querySelector('#chk-promise');
    const btnSubmit = modal.querySelector('#btn-submit-join');

    chk.addEventListener('change', (e) => {
      btnSubmit.disabled = !e.target.checked;
    });

    modal.querySelector('#btn-cancel').onclick = () => modal.remove();
    btnSubmit.onclick = () => {
      modal.remove();
      onConfirm();
    };
  }
};
```

- [ ] **Step 2: 在上车按钮中接入防鸽弹窗**

点击“我要上车”时触发 `Credit.showCommitModal`，若未勾选承诺则禁止提交。

---

### Task 4: 微信 4 格拼局卡片与 Canvas 动态海报

**Files:**
- Create: `js/poster.js`
- Create: `css/poster.css`

**Interfaces:**
- Consumes: `Room` 对象
- Produces: `Poster.generateCanvas(room)`

- [ ] **Step 1: 创建海报与 4 格席位渲染模块 `js/poster.js`**

```javascript
// js/poster.js
export const Poster = {
  renderSeats(players, maxPlayers = 4) {
    const seatsHtml = [];
    for (let i = 0; i < maxPlayers; i++) {
      if (players[i]) {
        seatsHtml.push(`
          <div class="seat filled">
            <img src="${players[i].avatar}" />
            <span class="seat-name">${players[i].name}</span>
          </div>
        `);
      } else {
        seatsHtml.push(`
          <div class="seat empty pulsing">
            <span class="question-mark">?</span>
            <span class="seat-name">虚位以待</span>
          </div>
        `);
      }
    }
    return `<div class="seats-grid">${seatsHtml.join('')}</div>`;
  },

  generateCanvasPoster(room) {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');

    // 绘制国潮暗金背景
    ctx.fillStyle = '#121826';
    ctx.fillRect(0, 0, 600, 800);
    
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('🀄 麻友，你在哪儿？三缺一！', 60, 100);

    ctx.fillStyle = '#ffffff';
    ctx.font = '24px sans-serif';
    ctx.fillText(`玩法：${room.title}`, 60, 180);
    ctx.fillText(`地点：${room.address}`, 60, 230);
    ctx.fillText(`时间：${room.startTime}`, 60, 280);

    // 提示扫码直达
    ctx.fillStyle = '#9ca3af';
    ctx.fillText('微信长按识别小程序/H5卡片，立刻入局', 60, 720);

    return canvas.toDataURL('image/png');
  }
};
```

- [ ] **Step 2: 测试海报导出**

在房间详情中增加“导出朋友圈海报”按钮，弹出生成的 Base64 图片，验证无错。

---

### Task 5: 麻友名片盒与局后沉淀 (Contact Box & Re-engagement)

**Files:**
- Create: `js/contact.js`
- Modify: `js/store.js`

**Interfaces:**
- Consumes: `Store.getUser()`, `Store.saveUser()`
- Produces: `Contact.addContact(player)`, `Contact.getContacts()`

- [ ] **Step 1: 创建麻友联系人沉淀模块 `js/contact.js`**

```javascript
// js/contact.js
import { Store } from './store.js';

export const Contact = {
  addContact(player) {
    const user = Store.getUser();
    if (!user.contacts) user.contacts = [];
    if (!user.contacts.some(c => c.name === player.name)) {
      user.contacts.push(player);
      localStorage.setItem('mahjong_user', JSON.stringify(user));
      alert(`已成功将【${player.name}】添加至您的麻友名片盒！`);
    }
  },

  getContacts() {
    const user = Store.getUser();
    return user.contacts || [];
  }
};
```

- [ ] **Step 2: 全流程走通验证**

测试“散局 -> 添加麻友 -> 再次发局勾选一键通知”的完整交互逻辑。
