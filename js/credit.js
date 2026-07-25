// js/credit.js
import { Store } from './store.js';

export const Credit = {
  checkBanned() {
    const user = Store.getUser();
    if (user.isBanned) {
      alert('⚠️ 您的账号因此前无故爽约放鸽子，处于 7 天冷静封禁期内，无法在线发局或上车申请！');
      return true;
    }
    return false;
  },

  showCommitModal(room, onConfirm) {
    if (this.checkBanned()) return;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-card">
        <h3>🛡️ 上车守时与合规承诺</h3>
        <p style="font-size:0.9rem; margin-bottom:4px;">您即将申请上车：<strong>${room.title}</strong></p>
        <p style="font-size:0.85rem; color:var(--text-muted);">📍 地点：${room.address}</p>

        <div class="compliance-banner" style="margin:10px 0 6px 0; font-size:0.75rem;">
          <span>⚖️ <strong>防赌提醒：</strong>禁止任何形式金钱赌博，违者将被永久封禁并依法移交处理。</span>
        </div>

        <div class="promise-box">
          <label style="display:flex; gap:8px; cursor:pointer;">
            <input type="checkbox" id="chk-promise" style="margin-top:2px;" />
            <span>我承诺准时到达、文明打牌、绝无赌博行为。若无故爽约被局长标记，我同意接收<strong>封禁发局/上车 7 天</strong>惩罚。</span>
          </label>
        </div>

        <div class="modal-actions">
          <button id="btn-cancel-commit" class="btn-secondary">考虑一下</button>
          <button id="btn-submit-commit" class="btn-primary" disabled>确认申请上车</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const chk = modal.querySelector('#chk-promise');
    const btnSubmit = modal.querySelector('#btn-submit-commit');

    chk.addEventListener('change', (e) => {
      btnSubmit.disabled = !e.target.checked;
    });

    modal.querySelector('#btn-cancel-commit').onclick = () => modal.remove();
    btnSubmit.onclick = () => {
      modal.remove();
      onConfirm();
    };
  }
};
