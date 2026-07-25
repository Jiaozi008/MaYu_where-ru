// js/poster.js
export const Poster = {
  renderSeats(players, maxPlayers = 4) {
    const seatsHtml = [];
    for (let i = 0; i < maxPlayers; i++) {
      if (players[i]) {
        seatsHtml.push(`
          <div class="seat filled">
            <img src="${players[i].avatar}" alt="${players[i].name}" />
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

    // 绘制国潮夜间暗金背景
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 600, 800);

    // 边框装饰
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 6;
    ctx.strokeRect(20, 20, 560, 760);

    // 标语
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🀄 麻友，你在哪儿？急缺1人！', 300, 100);

    // 房间详情
    ctx.textAlign = 'left';
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(`【${room.title}】`, 50, 180);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '22px sans-serif';
    ctx.fillText(`📍 地点：[${room.district}·${room.area}] ${room.address}`, 50, 240);
    ctx.fillText(`⏰ 时间：${room.startTime}`, 50, 290);
    ctx.fillText(`👤 局长：${room.host.name} (${room.host.isGold ? '⚡黄金麻友' : '守时保证'})`, 50, 340);

    // 分隔线
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 380);
    ctx.lineTo(550, 380);
    ctx.stroke();

    // 席位信息
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('当前车况：已到 3 人，就差你了！', 50, 430);

    // 扫码指示区
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(150, 500, 300, 200);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('扫码即刻上车', 300, 610);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '18px sans-serif';
    ctx.fillText('无需下载 · 极简同城拼局', 300, 650);

    return canvas.toDataURL('image/png');
  },

  showPosterModal(room) {
    const dataUrl = this.generateCanvasPoster(room);
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-card poster-modal">
        <h3>🀄 微信朋友圈诱饵海报</h3>
        <p style="font-size:0.85rem; color:var(--text-muted);">长按保存图片或截图分享至微信群/朋友圈：</p>
        <img class="poster-preview" src="${dataUrl}" alt="海报预览" />
        <div class="modal-actions">
          <button id="btn-close-poster" class="btn-primary">关闭</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('#btn-close-poster').onclick = () => modal.remove();
  }
};
