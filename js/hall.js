// js/hall.js
import { Store } from './store.js?v=1.8.7';
import { Geo } from './geo.js?v=1.8.7';
import { Credit } from './credit.js?v=1.8.7';
import { Poster } from './poster.js?v=1.8.7';
import { Contact } from './contact.js?v=1.8.7';
import { Rules } from './rules.js?v=1.8.7';
import { Nav } from './nav.js?v=1.8.7';
import { Merchant } from './merchant.js?v=1.8.7';
import { Alarm } from './alarm.js?v=1.8.7';

export const Hall = {
  selectedArea: '全部商圈',
  selectedRule: '全部玩法',
  selectedTime: '全部时间',
  selectedStatus: '全部状态',
  currentPage: 1,
  pageSize: 10,

  render(containerEl) {
    const areas = Geo.getAvailableAreas();
    const ruleTypes = Rules.getAllRuleTypes();

    containerEl.innerHTML = `
      <!-- ⚖️ 合规防赌声明 Banner -->
      <div class="compliance-banner">
        <span class="compliance-badge">⚖️ 合规倡议</span>
        <div class="compliance-text">
          <strong>健康娱乐·严禁赌博：</strong>本平台仅供同城麻友休闲搭子组局匹配，严格禁止任何形式的金钱赌博行为，请文明娱乐。
        </div>
      </div>

      <!-- 🔍 多维度筛选栏 (商圈 + 玩法 + 时间 + 状态 2x2 网格对齐) -->
      <div class="filter-bar">
        <div class="filter-grid">
          <select id="area-select" class="filter-select">
            ${areas.map(a => `<option value="${a}" ${a === this.selectedArea ? 'selected' : ''}>${a}</option>`).join('')}
          </select>
          <select id="rule-select" class="filter-select">
            ${ruleTypes.map(r => `<option value="${r}" ${r === this.selectedRule ? 'selected' : ''}>${r}</option>`).join('')}
          </select>
          <select id="time-select" class="filter-select">
            <option value="全部时间" ${this.selectedTime === '全部时间' ? 'selected' : ''}>全部开局时间</option>
            <option value="今晚局" ${this.selectedTime === '今晚局' ? 'selected' : ''}>今晚局 (19:00后)</option>
            <option value="白天局" ${this.selectedTime === '白天局' ? 'selected' : ''}>白天局 (19:00前)</option>
          </select>
          <select id="status-select" class="filter-select">
            <option value="全部状态" ${this.selectedStatus === '全部状态' ? 'selected' : ''}>全部状态</option>
            <option value="缺人中" ${this.selectedStatus === '缺人中' ? 'selected' : ''}>🔥 缺人拼车中</option>
            <option value="已满车" ${this.selectedStatus === '已满车' ? 'selected' : ''}>✅ 已满发车</option>
          </select>
        </div>

        <div class="action-grid">
          <button id="btn-gps-upgrade" class="btn-secondary filter-btn">
            ${Geo.locationType === 'GPS' ? '🎯 GPS精准定位' : '🌐 IP识别(点击升级GPS)'}
          </button>
          <button id="btn-contacts" class="btn-secondary filter-btn">🎴 麻友盒</button>
          <button id="btn-create-room" class="btn-primary filter-btn">+ 快捷发局</button>
        </div>
      </div>

      <div class="room-list" id="room-list"></div>
      <div class="pagination-bar" id="pagination-bar"></div>
    `;

    this.updateRoomList();
    this.bindEvents(containerEl);
  },

  filterRooms(rooms) {
    const sorted = Merchant.sortMerchantRoomsFirst(rooms);

    return sorted.filter(room => {
      if (this.selectedArea !== '全部商圈' && room.area !== this.selectedArea) return false;
      if (this.selectedRule !== '全部玩法' && !room.title.includes(this.selectedRule) && room.ruleTag !== this.selectedRule) return false;
      if (this.selectedTime === '今晚局' && !room.startTime.includes('19:') && !room.startTime.includes('20:') && !room.startTime.includes('21:')) return false;
      if (this.selectedTime === '白天局' && (room.startTime.includes('19:') || room.startTime.includes('20:') || room.startTime.includes('21:'))) return false;
      
      const isFull = room.players.length >= room.maxPlayers;
      if (this.selectedStatus === '缺人中' && isFull) return false;
      if (this.selectedStatus === '已满车' && !isFull) return false;

      return true;
    });
  },

  renderGeofenceBanner(room) {
    const user = Store.getUser();
    const isUserJoined = room.players && room.players.some(p => p.name === user.name);

    if (!isUserJoined) {
      return `<div style="font-size:0.75rem; color:var(--text-muted); margin:4px 0;">
        📍 距目的地约 ${room.distance || 0.5}km
      </div>`;
    }

    // 必须在开启真实 GPS 授权且目标坐标有效时才判定电子围栏
    if (Geo.locationType !== 'GPS' || !room.coords) {
      return `<div style="font-size:0.75rem; color:var(--text-muted); margin:4px 0;">
        📍 距目的地约 ${room.distance || 0.5}km <span style="font-size:0.7rem; color:var(--accent-gold);">(开启 GPS 可触发电子围栏打卡)</span>
      </div>`;
    }

    const fence = Geo.isArrivedAtFence(room.coords.lat, room.coords.lng);
    if (fence && fence.arrived) {
      return `<div style="background:rgba(16, 185, 129, 0.15); border:1px solid rgba(16, 185, 129, 0.4); color:var(--accent-green); padding:6px 10px; border-radius:var(--radius-md); font-size:0.78rem; margin:8px 0;">
        📍 <strong>GPS 电子围栏判定：</strong>您已到达目的地 (距棋牌室 ${fence.distanceMeters}m)，系统已为您自动完成到场电子签到！
      </div>`;
    } else {
      const dist = (fence && fence.distanceMeters !== 9999) ? `${fence.distanceMeters}m` : `${room.distance || 0.5}km`;
      return `<div style="font-size:0.75rem; color:var(--text-muted); margin:4px 0;">
        📍 离目的地约 ${dist} (进入 200m 范围内将触发 GPS 自动打卡)
      </div>`;
    }
  },


  updateRoomList() {
    const rooms = Store.getRooms();
    const filtered = this.filterRooms(rooms);
    const listEl = document.getElementById('room-list');
    const pageEl = document.getElementById('pagination-bar');

    if (!filtered || filtered.length === 0) {
      listEl.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding:40px 0;">没有符合条件的麻将局，尝试调整筛选条件或点击“发局”！</div>`;
      pageEl.innerHTML = '';
      return;
    }

    const totalPages = Math.ceil(filtered.length / this.pageSize) || 1;
    if (this.currentPage > totalPages) this.currentPage = totalPages;
    if (this.currentPage < 1) this.currentPage = 1;

    const startIdx = (this.currentPage - 1) * this.pageSize;
    const paginatedRooms = filtered.slice(startIdx, startIdx + this.pageSize);

    listEl.innerHTML = paginatedRooms.map(room => {
      const isFull = room.players.length >= room.maxPlayers;
      const isMerchant = room.isMerchant;
      const user = Store.getUser();
      const isHost = (user.id === room.host.id || user.name === room.host.name);
      const isJoined = room.players.some(p => p.wechat === user.wechat || p.name === user.name);

      return `
        <div class="room-card ${isMerchant ? 'merchant' : ''}" data-id="${room.id}">
          <div class="room-header">
            <span class="tag-location">[${room.district}·${room.area}]</span>
            <span class="room-title">${room.title}</span>
            ${Merchant.renderBadge(room)}
          </div>
          
          <div class="room-body">
            <p class="room-address">
              📍 ${room.address} <span style="font-size:0.75rem; color:var(--accent-gold);">(约${room.distance}km)</span>
              <button class="btn-secondary btn-nav-map" style="font-size:0.7rem; padding:1px 6px; margin-left:6px;" data-address="${room.address}">🗺️ 一键导航</button>
            </p>
            <p class="room-time">⏰ 开局时间：${room.startTime}</p>
            
            <!-- 📍 GPS 电子围栏自动打卡 Banner -->
            ${this.renderGeofenceBanner(room)}

            <!-- 4 格席位展示 -->
            ${Poster.renderSeats(room.players, room.maxPlayers)}

            <div class="host-info">
              <img class="avatar-sm" src="${room.host.avatar}" />
              <span>局长：${room.host.name}</span>
              ${room.host.isGold ? '<span class="badge-gold">⚡ 黄金麻友</span>' : ''}
              ${isHost ? `
                <div style="margin-left:auto; display:flex; gap:4px;">
                  <button class="btn-secondary btn-edit-room" style="font-size:0.75rem; padding:2px 8px; color:var(--accent-gold); border-color:var(--accent-gold);" data-id="${room.id}">✏️ 编辑本局</button>
                  <button class="btn-secondary btn-delete-room" style="font-size:0.75rem; padding:2px 8px; color:var(--danger); border-color:var(--danger);" data-id="${room.id}">🗑️ 解散</button>
                </div>
              ` : `
                <button class="btn-secondary btn-add-contact" style="margin-left:auto; font-size:0.75rem; padding:2px 8px;" data-host='${JSON.stringify(room.host)}'>加为麻友</button>
              `}
            </div>
          </div>
          
          <div style="display:flex; gap:8px; margin-top:12px;">
            <button class="btn-secondary btn-poster" style="flex:1;" data-id="${room.id}">朋友圈海报</button>
            ${isJoined ? `
              <div style="flex:2; display:flex; gap:6px;">
                <button class="btn-primary btn-view-contacts" style="flex:1.2; margin-top:0; background:linear-gradient(135deg, #10b981, #059669);" data-id="${room.id}">
                  查看联络卡
                </button>
                ${!isHost ? `
                  <button class="btn-secondary btn-leave" style="flex:0.8; font-size:0.78rem; padding:4px 6px; color:var(--danger); border-color:var(--danger);" data-id="${room.id}">
                    🚪 退车
                  </button>
                ` : ''}
              </div>
            ` : isFull ? `
              <button class="btn-primary btn-view-contacts" style="flex:2; margin-top:0; background:linear-gradient(135deg, #10b981, #059669);" data-id="${room.id}">
                ✅ 满车·查看同桌联络卡
              </button>
            ` : `
              <button class="btn-join" style="flex:2; margin-top:0;" data-id="${room.id}">
                我要上车 (${room.players.length}/${room.maxPlayers})
              </button>
            `}
          </div>
        </div>
      `;
    }).join('');

    pageEl.innerHTML = `
      <div style="display:flex; align-items:center; gap:6px;">
        <select id="page-size-select" class="filter-select" style="padding:4px 6px; font-size:0.78rem;">
          <option value="10" ${this.pageSize === 10 ? 'selected' : ''}>10 条/页</option>
          <option value="20" ${this.pageSize === 20 ? 'selected' : ''}>20 条/页</option>
          <option value="50" ${this.pageSize === 50 ? 'selected' : ''}>50 条/页</option>
        </select>
      </div>

      <div style="display:flex; align-items:center; gap:8px;">
        <button id="btn-prev-page" class="btn-secondary" style="font-size:0.78rem; padding:4px 8px;" ${this.currentPage === 1 ? 'disabled' : ''}>← 上一页</button>
        <span class="page-info" style="font-size:0.78rem;">${this.currentPage} / ${totalPages} 页 (共 ${filtered.length} 局)</span>
        <button id="btn-next-page" class="btn-secondary" style="font-size:0.78rem; padding:4px 8px;" ${this.currentPage === totalPages ? 'disabled' : ''}>下一页 →</button>
      </div>
    `;

    const pageSizeSelect = pageEl.querySelector('#page-size-select');
    const prevBtn = pageEl.querySelector('#btn-prev-page');
    const nextBtn = pageEl.querySelector('#btn-next-page');

    if (pageSizeSelect) {
      pageSizeSelect.onchange = (e) => {
        this.pageSize = parseInt(e.target.value, 10);
        this.currentPage = 1;
        this.updateRoomList();
      };
    }

    if (prevBtn) {
      prevBtn.onclick = () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.updateRoomList();
        }
      };
    }

    if (nextBtn) {
      nextBtn.onclick = () => {
        if (this.currentPage < totalPages) {
          this.currentPage++;
          this.updateRoomList();
        }
      };
    }
  },

  showConflictSwitchModal(oldRoom, newRoom, rooms) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-card">
        <h3 style="color:var(--accent-gold);">⚠️ 上车冲突·排期独占提醒</h3>
        
        <div class="compliance-banner" style="margin:10px 0; background:rgba(239, 68, 68, 0.1); border-color:rgba(239, 68, 68, 0.3);">
          <span>🛡️ <strong>守约倡议：</strong>为防止麻友多占排期放鸽子，同一用户同一时间只能加入 1 个局。</span>
        </div>

        <div style="font-size:0.85rem; color:var(--text-muted); line-height:1.6; margin:12px 0;">
          <p style="margin-bottom:6px;">您当前已加入拼车：<br><strong style="color:var(--text-main);">【${oldRoom.title}】</strong> (${oldRoom.startTime})</p>
          <p>准备改上车新局：<br><strong style="color:var(--accent-green);">【${newRoom.title}】</strong> (${newRoom.startTime})</p>
        </div>

        <div class="modal-actions" style="margin-top:16px;">
          <button id="btn-cancel-switch" class="btn-secondary">保持原局</button>
          <button id="btn-confirm-switch" class="btn-primary" style="background:linear-gradient(135deg, #ef4444, #dc2626);">自动退出旧局并上新局</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('#btn-cancel-switch').onclick = () => modal.remove();
    modal.querySelector('#btn-confirm-switch').onclick = () => {
      const user = Store.getUser();
      // 1. 自动退出旧局
      oldRoom.players = oldRoom.players.filter(p => !(p.wechat === user.wechat || p.name === user.name));
      // 2. 加入新局
      newRoom.players.push({
        name: user.name,
        avatar: user.avatar,
        wechat: user.wechat || '',
        phone: user.phone || ''
      });
      Store.saveRooms(rooms);
      modal.remove();
      this.updateRoomList();
      alert(`🚀 已自动帮您退出旧局【${oldRoom.title}】，成功改上新局！原局席位已及时释放给其他麻友。`);
    };
  },

  bindEvents(containerEl) {
    containerEl.querySelector('#area-select').addEventListener('change', (e) => {
      this.selectedArea = e.target.value;
      this.currentPage = 1;
      this.updateRoomList();
    });

    containerEl.querySelector('#rule-select').addEventListener('change', (e) => {
      this.selectedRule = e.target.value;
      this.currentPage = 1;
      this.updateRoomList();
    });

    containerEl.querySelector('#time-select').addEventListener('change', (e) => {
      this.selectedTime = e.target.value;
      this.currentPage = 1;
      this.updateRoomList();
    });

    containerEl.querySelector('#status-select').addEventListener('change', (e) => {
      this.selectedStatus = e.target.value;
      this.currentPage = 1;
      this.updateRoomList();
    });

    const btnGps = containerEl.querySelector('#btn-gps-upgrade');
    if (btnGps) {
      btnGps.onclick = async () => {
        btnGps.innerText = '⏳ 定位中...';
        const res = await Geo.requestGPSUpgrade();
        if (res.success) {
          btnGps.innerText = '🎯 GPS精准定位';
          alert(`🎯 GPS 定位升级成功！已精准定位在【${res.area}】，为你显示最邻近局。`);
        } else {
          btnGps.innerText = '🌐 IP识别(点击升级GPS)';
          alert(`未获得 GPS 高精授权，继续保持【IP 自动保底识别】。`);
        }
        this.updateRoomList();
      };
    }

    containerEl.querySelector('#btn-contacts').onclick = () => {
      Contact.renderContactSelectorModal();
    };

    containerEl.querySelector('#btn-create-room').onclick = () => {
      this.showCreateRoomModal();
    };

    containerEl.querySelector('#room-list').addEventListener('click', (e) => {
      const joinBtn = e.target.closest('.btn-join');
      const leaveBtn = e.target.closest('.btn-leave');
      const viewContactsBtn = e.target.closest('.btn-view-contacts');
      const posterBtn = e.target.closest('.btn-poster');
      const addContactBtn = e.target.closest('.btn-add-contact');
      const navMapBtn = e.target.closest('.btn-nav-map');
      const editRoomBtn = e.target.closest('.btn-edit-room');
      const deleteRoomBtn = e.target.closest('.btn-delete-room');

      if (leaveBtn) {
        const roomId = leaveBtn.getAttribute('data-id');
        const rooms = Store.getRooms();
        const room = rooms.find(r => r.id === roomId);
        if (room && confirm(`确认退出【${room.title}】？退车后将让席位给其他同城麻友。`)) {
          const user = Store.getUser();
          room.players = room.players.filter(p => !(p.wechat === user.wechat || p.name === user.name));
          Store.saveRooms(rooms);
          this.updateRoomList();
          alert('🚪 已成功退出本局！席位已释放。');
        }
      }

      if (editRoomBtn) {
        const roomId = editRoomBtn.getAttribute('data-id');
        const room = Store.getRooms().find(r => r.id === roomId);
        if (room) {
          this.showEditRoomModal(room);
        }
      }

      if (deleteRoomBtn) {
        const roomId = deleteRoomBtn.getAttribute('data-id');
        if (confirm('确认解散并删除该麻将局？')) {
          const rooms = Store.getRooms().filter(r => r.id !== roomId);
          Store.saveRooms(rooms);
          this.updateRoomList();
          alert('🗑️ 本局已成功解散并移除公开大厅。');
        }
      }

      if (joinBtn) {
        const roomId = joinBtn.getAttribute('data-id');
        const rooms = Store.getRooms();
        const room = rooms.find(r => r.id === roomId);
        if (room) {
          const user = Store.getUser();
          // 检查该用户是否已在其他匹配中/未发局完结的房间上车
          const existingJoined = rooms.filter(r => r.id !== room.id && r.players.some(p => p.wechat === user.wechat || p.name === user.name));
          
          if (existingJoined.length > 0) {
            const oldRoom = existingJoined[0];
            this.showConflictSwitchModal(oldRoom, room, rooms);
            return;
          }

          Credit.showCommitModal(room, () => {
            room.players.push({
              name: user.name,
              avatar: user.avatar,
              wechat: user.wechat || '',
              phone: user.phone || ''
            });
            Store.saveRooms(rooms);
            this.updateRoomList();
            this.showContactCardModal(room);
          });
        }
      }

      if (viewContactsBtn) {
        const roomId = viewContactsBtn.getAttribute('data-id');
        const room = Store.getRooms().find(r => r.id === roomId);
        if (room) {
          this.showContactCardModal(room);
        }
      }

      if (posterBtn) {
        const roomId = posterBtn.getAttribute('data-id');
        const room = Store.getRooms().find(r => r.id === roomId);
        if (room) {
          Poster.showPosterModal(room);
        }
      }

      if (addContactBtn) {
        const hostData = JSON.parse(addContactBtn.getAttribute('data-host'));
        Contact.addContact(hostData);
      }

      if (navMapBtn) {
        const address = navMapBtn.getAttribute('data-address');
        Nav.showNavChoiceModal(address);
      }
    });
  },

  showContactCardModal(room) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-card">
        <h3 style="color:var(--accent-green);">🎉 拼局成功·同桌麻友联络卡</h3>
        <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:6px;">
          📍 局名：${room.title}<br>
          🏢 地点：${room.address}
        </p>

        <div style="margin-bottom:10px;">
          <button id="btn-modal-nav" class="btn-secondary" style="width:100%; font-size:0.8rem; padding:4px 0;">🗺️ 调起高德/腾讯地图一键导航</button>
        </div>

        <!-- 🀄 接头暗语码区 -->
        <div style="background:linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.06)); border:1px solid rgba(245,158,11,0.35); border-radius:var(--radius-md); padding:12px 14px; margin:8px 0;">
          <div style="font-size:0.8rem; color:var(--accent-gold); font-weight:bold; margin-bottom:8px;">🀄 你的接头暗语（今日专属）</div>
          <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
            <div id="my-secret-code" style="font-size:1.3rem; font-weight:bold; letter-spacing:2px; color:var(--text-main);">
              ${Store.generateSecretCode(room.id, room.players.findIndex(p => p.name === Store.getUser().name))}
            </div>
            <button id="btn-copy-code" class="btn-secondary" style="font-size:0.75rem; padding:4px 10px; white-space:nowrap;">📋 复制</button>
          </div>
          <p style="font-size:0.72rem; color:var(--text-muted); margin-top:6px; line-height:1.5;">
            线下见面互报暗语，双方一致即完成身份确认 ✅<br>每日自动换码，今日离场后自动失效。
          </p>
        </div>

        <!-- 📱 微信群入口（如局长填写了群链接） -->
        ${room.wechatGroupUrl ? `
        <div style="margin:6px 0;">
          <a id="btn-join-group" href="${room.wechatGroupUrl}" target="_blank" rel="noopener" class="btn-primary" style="display:block; text-align:center; padding:7px 0; font-size:0.85rem; background:linear-gradient(135deg, #07c160, #05a050); text-decoration:none;">
            💬 点击进入局长的麻友群
          </a>
        </div>` : ''}

        <div class="compliance-banner" style="margin:8px 0; font-size:0.75rem;">
          <span>⚖️ 提醒：请线下文明娱乐，严禁任何形式赌博。如遇违法行为请及时举报。</span>
        </div>

        <div class="unlocked-contacts-list" style="display:flex; flex-direction:column; gap:10px; margin:12px 0; max-height:180px; overflow-y:auto;">
          ${room.players.map((p, idx) => `
            <div style="background:var(--bg-primary); border:1px solid var(--border-color); padding:10px; border-radius:var(--radius-md); display:flex; align-items:center; justify-content:space-between;">
              <div style="display:flex; align-items:center; gap:8px;">
                <img class="avatar-sm" src="${p.avatar}" />
                <div>
                  <div style="font-weight:bold; font-size:0.9rem;">${p.name} ${idx === 0 ? '<span class="tag-location">局长</span>' : ''}</div>
                  <div style="font-size:0.75rem; color:var(--text-muted);">微信号: <span class="wx-text" style="color:var(--accent-gold);">${p.wechat || '未填写'}</span></div>
                </div>
              </div>
              <div style="display:flex; flex-direction:column; gap:4px;">
                <button class="btn-secondary btn-copy-wx" style="font-size:0.75rem; padding:3px 8px;" data-wx="${p.wechat || ''}">📋 复制微信</button>
                ${idx > 0 ? `<button class="btn-secondary btn-mark-flake" style="font-size:0.72rem; padding:2px 6px; color:var(--danger); border-color:var(--danger);" data-roomid="${room.id}" data-idx="${idx}">⚠️ 没来放鸽子(标记封禁7天)</button>` : ''}
              </div>
            </div>
          `).join('')}
        </div>

        <div style="margin-top:10px; padding-top:10px; border-top:1px dashed var(--border-color); text-align:center;">
          <button id="btn-complete-session" class="btn-primary" style="width:100%; background:linear-gradient(135deg, #10b981, #047857);">✅ 输入暗语确认到场 (履约+1)</button>
          <p style="font-size:0.72rem; color:var(--text-muted); margin-top:4px;">🛡️ 输入自己的暗语码确认到场；超时无投诉系统也将自动为你加 +1 履约勋章。</p>
        </div>

        <div class="modal-actions" style="margin-top:12px;">
          <button id="btn-close-card" class="btn-secondary">关闭名片</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('#btn-complete-session').onclick = () => {
      const user = Store.getUser();
      const myIdx = room.players.findIndex(pl => pl.name === user.name);
      const myCode = Store.generateSecretCode(room.id, myIdx >= 0 ? myIdx : 0);
      const input = prompt(`🀄 请输入你的接头暗语码确认到场：\n（你的暗语：${myCode}）`);
      if (input === null) return; // 取消
      if (input.trim() === myCode) {
        user.fulfilledCount = (user.fulfilledCount || 0) + 1;
        Store.saveUser(user);
        alert(`✅ 暗语核对正确！到场确认成功，履约勋章 +1，当前累计 ${user.fulfilledCount} 次守时记录。`);
        modal.remove();
      } else {
        alert(`❌ 暗语不符，请重新查看联络卡中的"你的接头暗语"后再输入。`);
      }
    };

    // 复制暗语码按钮
    const btnCopyCode = modal.querySelector('#btn-copy-code');
    if (btnCopyCode) {
      btnCopyCode.onclick = () => {
        const code = modal.querySelector('#my-secret-code').textContent.trim();
        if (navigator.clipboard) navigator.clipboard.writeText(code);
        alert(`📋 暗语码【${code}】已复制！线下见面时互报即可确认身份。`);
      };
    }

    modal.querySelectorAll('.btn-mark-flake').forEach(btn => {
      btn.onclick = (e) => {
        const rId = e.target.getAttribute('data-roomid');
        const pIdx = parseInt(e.target.getAttribute('data-idx'), 10);
        if (confirm('确认该麻友放鸽子未到场？系统将对其封禁 7 天发局与上车权限！')) {
          Alarm.replacePlayer(rId, pIdx);
          modal.remove();
          this.updateRoomList();
        }
      };
    });

    modal.querySelector('#btn-modal-nav').onclick = () => {
      Nav.showNavChoiceModal(room.address);
    };

    modal.querySelectorAll('.btn-copy-wx').forEach(btn => {
      btn.onclick = (e) => {
        const wx = e.target.getAttribute('data-wx');
        if (navigator.clipboard) {
          navigator.clipboard.writeText(wx);
        }
        alert(`📋 微信号【${wx}】已复制！请打开微信搜索添加好友。`);
      };
    });

    modal.querySelector('#btn-close-card').onclick = () => modal.remove();
  },

  formatTimeRange(dateStr, startTime, endTime) {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    const tom = new Date(now);
    tom.setDate(now.getDate() + 1);
    const tomorrowStr = `${tom.getFullYear()}-${String(tom.getMonth() + 1).padStart(2, '0')}-${String(tom.getDate()).padStart(2, '0')}`;

    let prefix = '';

    if (dateStr) {
      // 用正则匹配精准提取 年(4位) - 月(1~2位) - 日(1~2位)
      const match = dateStr.match(/(\d{4})[^\d]?(\d{1,2})[^\d]?(\d{1,2})/);
      if (match) {
        const year = match[1];
        const month = match[2].padStart(2, '0');
        const day = match[3].padStart(2, '0');
        const normalized = `${year}-${month}-${day}`;
        const mmdd = `${month}-${day}`;

        if (normalized === todayStr) {
          prefix = `今天 (${mmdd})`;
        } else if (normalized === tomorrowStr) {
          prefix = `明天 (${mmdd})`;
        } else {
          prefix = `${mmdd}`;
        }
      } else {
        const mmdd = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        prefix = `今天 (${mmdd})`;
      }
    } else {
      const mmdd = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      prefix = `今天 (${mmdd})`;
    }

    const sTime = startTime || '19:00';
    const eTime = endTime || '23:00';
    return `${prefix} ${sTime}-${eTime}`;
  },

  showCreateRoomModal() {
    if (Credit.checkBanned()) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const currentArea = Geo.getCurrentArea();
    const ruleTypes = Rules.getAllRuleTypes().filter(r => r !== '全部玩法');
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-card">
        <h3>🀄 快捷摇人·发起麻将局</h3>
        
        <div class="compliance-banner" style="margin-top:8px;">
          <span>⚖️ <strong>文明承诺：</strong>发起牌局仅限闲暇搭子匹配娱乐，严禁涉及金钱赌博。</span>
        </div>

        <div style="display:flex; flex-direction:column; gap:12px; margin:12px 0;">
          <div>
            <label style="font-size:0.85rem; color:var(--text-muted);">麻将玩法品类：</label>
            <select id="input-ruletag" class="filter-select" style="width:100%; margin-top:4px;">
              ${ruleTypes.map(r => `<option value="${r}" ${r === '广东鸡平胡' ? 'selected' : ''}>${r}</option>`).join('')}
            </select>
          </div>
          <div>
            <label style="font-size:0.85rem; color:var(--text-muted);">局名/规则底分：</label>
            <input id="input-title" type="text" class="filter-select" style="width:100%; margin-top:4px;" value="" placeholder="如：20分底·包厢特惠·急缺2人" />
          </div>
          <div>
            <label style="font-size:0.85rem; color:var(--text-muted);">商圈自动定位：</label>
            <input id="input-area" type="text" class="filter-select" style="width:100%; margin-top:4px;" value="${currentArea}" readonly />
          </div>
          <div>
            <label style="font-size:0.85rem; color:var(--text-muted);">详细地点/棋牌室门牌：</label>
            <input id="input-address" type="text" class="filter-select" style="width:100%; margin-top:4px;" placeholder="如：胖子棋牌室 6号包厢" />
          </div>
          <div>
            <label style="font-size:0.85rem; color:var(--text-muted);">⏰ 开局日期与时间段：</label>
            <div style="display:flex; align-items:center; gap:6px; margin-top:4px;">
              <input id="input-date" type="date" class="filter-select" style="flex:1.3;" value="${todayStr}" />
              <input id="input-start-time" type="time" class="filter-select" style="flex:1;" value="19:00" />
              <span style="font-size:0.8rem; color:var(--text-muted);">至</span>
              <input id="input-end-time" type="time" class="filter-select" style="flex:1;" value="23:00" />
            </div>
          </div>
          <div>
            <label style="font-size:0.85rem; color:var(--text-muted);">📱 微信群链接（可选）：</label>
            <input id="input-group-url" type="url" class="filter-select" style="width:100%; margin-top:4px;" placeholder="可选·粘贴微信群邀请链接，拼友上车后可直接进群" />
          </div>
        </div>
        <div class="modal-actions">
          <button id="btn-cancel-create" class="btn-secondary">取消</button>
          <button id="btn-submit-create" class="btn-primary">生成拼局卡片发局</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('#btn-cancel-create').onclick = () => modal.remove();
    modal.querySelector('#btn-submit-create').onclick = () => {
      const ruleTag = modal.querySelector('#input-ruletag').value;
      const titleInput = modal.querySelector('#input-title').value.trim();
      const title = titleInput || '20分底·急缺麻友';
      const address = modal.querySelector('#input-address').value.trim() || '同城棋牌室';
      const dateVal = modal.querySelector('#input-date').value;
      const startTimeVal = modal.querySelector('#input-start-time').value;
      const endTimeVal = modal.querySelector('#input-end-time').value;
      const time = this.formatTimeRange(dateVal, startTimeVal, endTimeVal);
      const groupUrl = modal.querySelector('#input-group-url').value.trim();
      const user = Store.getUser();

      const newRoom = {
        id: 'room_' + Date.now(),
        title: `【${ruleTag}】${title}`,
        city: Geo.getCurrentCity(),
        district: Geo.getCurrentArea(),
        area: currentArea,
        address,
        distance: 0.5,
        ruleTag,
        isMerchant: false,
        wechatGroupUrl: groupUrl,
        host: {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          creditRate: 100,
          isGold: true,
          wechat: user.wechat || '',
          phone: user.phone || ''
        },
        players: [{
          name: user.name,
          avatar: user.avatar,
          wechat: user.wechat || '',
          phone: user.phone || '',
        }],
        maxPlayers: 4,
        startTime: time,
        status: 'MATCHING'
      };

      Store.addRoom(newRoom);
      modal.remove();
      this.updateRoomList();
      alert('🚀 发局成功！已生成大厅公开局，可点击“朋友圈海报”一键生成微信社交诱饵图片！');
    };
  },

  showEditRoomModal(room) {
    const ruleTypes = Rules.getAllRuleTypes().filter(r => r !== '全部玩法');
    const rawTitle = room.title.replace(/^【.*?】\s*/, '');
    const todayStr = new Date().toISOString().split('T')[0];

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-card">
        <h3>✏️ 局长修改·本局信息</h3>
        
        <div style="display:flex; flex-direction:column; gap:12px; margin:12px 0;">
          <div>
            <label style="font-size:0.85rem; color:var(--text-muted);">麻将玩法品类：</label>
            <select id="edit-ruletag" class="filter-select" style="width:100%; margin-top:4px;">
              ${ruleTypes.map(r => `<option value="${r}" ${r === room.ruleTag ? 'selected' : ''}>${r}</option>`).join('')}
            </select>
          </div>
          <div>
            <label style="font-size:0.85rem; color:var(--text-muted);">局名/规则底分：</label>
            <input id="edit-title" type="text" class="filter-select" style="width:100%; margin-top:4px;" value="${rawTitle}" />
          </div>
          <div>
            <label style="font-size:0.85rem; color:var(--text-muted);">详细地点/棋牌室门牌：</label>
            <input id="edit-address" type="text" class="filter-select" style="width:100%; margin-top:4px;" value="${room.address}" />
          </div>
          <div>
            <label style="font-size:0.85rem; color:var(--text-muted);">开局日期与时间段：</label>
            <div style="display:flex; align-items:center; gap:6px; margin-top:4px;">
              <input id="edit-date" type="date" class="filter-select" style="flex:1.3;" value="${todayStr}" />
              <input id="edit-start-time" type="time" class="filter-select" style="flex:1;" value="19:00" />
              <span style="font-size:0.8rem; color:var(--text-muted);">至</span>
              <input id="edit-end-time" type="time" class="filter-select" style="flex:1;" value="23:00" />
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button id="btn-cancel-edit" class="btn-secondary">取消</button>
          <button id="btn-submit-edit" class="btn-primary">保存修改</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('#btn-cancel-edit').onclick = () => modal.remove();
    modal.querySelector('#btn-submit-edit').onclick = () => {
      const ruleTag = modal.querySelector('#edit-ruletag').value;
      const title = modal.querySelector('#edit-title').value.trim();
      const address = modal.querySelector('#edit-address').value.trim() || '同城棋牌室';
      const dateVal = modal.querySelector('#edit-date').value;
      const startTimeVal = modal.querySelector('#edit-start-time').value;
      const endTimeVal = modal.querySelector('#edit-end-time').value;
      const time = this.formatTimeRange(dateVal, startTimeVal, endTimeVal);

      const rooms = Store.getRooms();
      const target = rooms.find(r => r.id === room.id);
      if (target) {
        target.ruleTag = ruleTag;
        target.title = `【${ruleTag}】${title}`;
        target.address = address;
        target.startTime = time;
        Store.saveRooms(rooms);
        modal.remove();
        this.updateRoomList();
        alert('✏️ 本局信息已成功保存修改！');
      }
    };
  }
};
