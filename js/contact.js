// js/contact.js
import { Store } from './store.js';

export const Contact = {
  addContact(player) {
    const user = Store.getUser();
    if (!user.contacts) user.contacts = [];
    if (!user.contacts.some(c => c.name === player.name)) {
      user.contacts.push(player);
      Store.saveUser(user);
      alert(`🎉 已成功将麻友【${player.name}】添加至您的常用麻友名片盒！`);
    } else {
      alert(`【${player.name}】已经在您的名片盒中了！`);
    }
  },

  getContacts() {
    const user = Store.getUser();
    return user.contacts || [];
  },

  renderContactSelectorModal(onSelect) {
    const contacts = this.getContacts();
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-card">
        <h3>🀄 常用麻友名片盒</h3>
        ${contacts.length === 0 ? '<p style="color:var(--text-muted); padding:12px 0;">名片盒暂无好友，打完一局后可保存同桌麻友！</p>' : ''}
        <div class="contact-list" style="margin:12px 0; max-height:200px; overflow-y:auto;">
          ${contacts.map(c => `
            <div class="contact-item" style="display:flex; align-items:center; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--border-color);">
              <div style="display:flex; align-items:center; gap:8px;">
                <img class="avatar-sm" src="${c.avatar}" />
                <span>${c.name}</span>
              </div>
              <button class="btn-secondary btn-invite-contact" data-name="${c.name}">一键通知</button>
            </div>
          `).join('')}
        </div>
        <div class="modal-actions">
          <button id="btn-close-contacts" class="btn-primary">关闭</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelectorAll('.btn-invite-contact').forEach(btn => {
      btn.onclick = (e) => {
        const name = e.target.getAttribute('data-name');
        alert(`已向麻友【${name}】发送一键开局邀约提醒卡片！`);
      };
    });

    modal.querySelector('#btn-close-contacts').onclick = () => modal.remove();
  }
};
