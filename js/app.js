// js/app.js
import { Store } from './store.js';
import { Hall } from './hall.js';

document.addEventListener('DOMContentLoaded', () => {
  const user = Store.getUser();

  // 渲染 Header 个人徽章
  const userBadgeEl = document.getElementById('user-badge');
  userBadgeEl.innerHTML = `
    <img class="avatar-xs" src="${user.avatar}" alt="${user.name}" />
    <span>${user.name}</span>
    <span class="badge-gold">履约 ${user.fulfilledCount} 次</span>
  `;

  // 渲染大厅
  const mainContentEl = document.getElementById('main-content');
  Hall.render(mainContentEl);
});
