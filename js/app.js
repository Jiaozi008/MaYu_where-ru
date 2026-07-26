// js/app.js
import { Store } from './store.js?v=1.9.6';
import { Hall } from './hall.js?v=1.9.6';

// 预设头像种子列表（DiceBear bottts 风格）
const AVATAR_SEEDS = [
  'Me', 'Tiger', 'Dragon', 'Phoenix', 'Bear', 'Wolf',
  'Eagle', 'Panda', 'Fox', 'Rabbit', 'Lion', 'Owl'
];

function renderUserBadge() {
  const user = Store.getUser();
  const el = document.getElementById('user-badge');
  el.innerHTML = `
    <img class="avatar-xs" src="${user.avatar}" alt="${user.name}" />
    <span>${user.name}</span>
    <span class="badge-gold">履约 ${user.fulfilledCount} 次</span>
    <span style="font-size:0.7rem; color:var(--text-muted); margin-left:2px;">✏️</span>
  `;
  el.style.cursor = 'pointer';
  el.title = '点击编辑个人名片';
  el.onclick = showProfileModal;
}

function showProfileModal() {
  const user = Store.getUser();
  const existing = document.getElementById('profile-modal-overlay');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'profile-modal-overlay';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-card">
      <h3 style="color:var(--accent-gold);">🎴 编辑个人名片</h3>

      <!-- 头像选择 -->
      <div style="margin-bottom:12px;">
        <label style="font-size:0.82rem; color:var(--text-muted);">选择头像：</label>
        <div id="avatar-picker" style="display:flex; flex-wrap:wrap; gap:8px; margin-top:8px;">
          ${AVATAR_SEEDS.map(seed => {
            const url = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;
            const selected = user.avatar === url;
            return `<img
              class="avatar-option ${selected ? 'avatar-option-selected' : ''}"
              src="${url}"
              data-seed="${seed}"
              style="width:42px; height:42px; border-radius:50%; cursor:pointer; border:2px solid ${selected ? 'var(--accent-gold)' : 'transparent'}; transition:border 0.2s;"
            />`;
          }).join('')}
        </div>
      </div>

      <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:14px;">
        <div>
          <label style="font-size:0.82rem; color:var(--text-muted);">昵称：</label>
          <input id="profile-name" type="text" class="filter-select" style="width:100%; margin-top:4px;"
            value="${user.name}" placeholder="你的麻友昵称" maxlength="12" />
        </div>
        <div>
          <label style="font-size:0.82rem; color:var(--text-muted);">微信号（可选）：</label>
          <input id="profile-wechat" type="text" class="filter-select" style="width:100%; margin-top:4px;"
            value="${user.wechat || ''}" placeholder="拼成功后同桌可见" />
        </div>
        <div>
          <label style="font-size:0.82rem; color:var(--text-muted);">手机号（可选）：</label>
          <input id="profile-phone" type="tel" class="filter-select" style="width:100%; margin-top:4px;"
            value="${user.phone || ''}" placeholder="拼成功后同桌可见" maxlength="11" />
        </div>
      </div>

      <div class="compliance-banner" style="font-size:0.72rem; margin-bottom:10px;">
        <span>🔒 微信号和手机号仅在拼局成功后对同桌麻友可见，平台不对外泄露。</span>
      </div>

      <div class="modal-actions">
        <button id="btn-cancel-profile" class="btn-secondary">取消</button>
        <button id="btn-save-profile" class="btn-primary">保存名片</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // 头像选择交互
  let selectedAvatar = user.avatar;
  modal.querySelectorAll('.avatar-option').forEach(img => {
    img.onclick = () => {
      modal.querySelectorAll('.avatar-option').forEach(i => {
        i.style.border = '2px solid transparent';
        i.classList.remove('avatar-option-selected');
      });
      img.style.border = '2px solid var(--accent-gold)';
      img.classList.add('avatar-option-selected');
      selectedAvatar = img.src;
    };
  });

  modal.querySelector('#btn-cancel-profile').onclick = () => modal.remove();

  modal.querySelector('#btn-save-profile').onclick = () => {
    const name = modal.querySelector('#profile-name').value.trim() || '极简麻友';
    const wechat = modal.querySelector('#profile-wechat').value.trim();
    const phone = modal.querySelector('#profile-phone').value.trim();
    const updated = { ...user, name, wechat, phone, avatar: selectedAvatar };
    Store.saveUser(updated);
    modal.remove();
    renderUserBadge();
    alert(`🎴 名片已更新！昵称：${name}${wechat ? '，微信：' + wechat : ''}。拼局时将自动使用新名片信息。`);
  };

  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
}

document.addEventListener('DOMContentLoaded', () => {
  renderUserBadge();

  // 渲染大厅
  const mainContentEl = document.getElementById('main-content');
  Hall.render(mainContentEl);
});
