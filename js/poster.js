import { QRCode } from './qrcode.js?v=1.8.7';

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

  async generateCanvasPoster(room) {
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
    ctx.fillText('🀄 麻友，你在哪儿？急缺1人！', 300, 90);

    // 房间详情
    ctx.textAlign = 'left';
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(`【${room.title}】`, 50, 160);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '22px sans-serif';
    ctx.fillText(`📍 地点：[${room.district}·${room.area}] ${room.address}`, 50, 215);
    ctx.fillText(`⏰ 时间：${room.startTime}`, 50, 260);
    ctx.fillText(`👤 局长：${room.host.name} (${room.host.isGold ? '⚡黄金麻友' : '守时保证'})`, 50, 305);

    // 分隔线
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 340);
    ctx.lineTo(550, 340);
    ctx.stroke();

    // 席位信息
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(`当前车况：已到 ${room.players.length} 人，就差 ${room.maxPlayers - room.players.length} 人！`, 50, 385);

    // 绘制二维码区域：优先绘制局长上传的微信群二维码图片
    const userQrImage = room.wechatGroupQr || (room.wechatGroupUrl && room.wechatGroupUrl.startsWith('data:image') ? room.wechatGroupUrl : null);
    let hasUserQr = false;

    if (userQrImage) {
      try {
        await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(205, 415, 190, 190);
            ctx.drawImage(img, 215, 425, 170, 170);
            hasUserQr = true;
            resolve();
          };
          img.onerror = reject;
          img.src = userQrImage;
        });
      } catch (e) {
        console.warn('局长微信群二维码绘制失败，回退为网页算法二维码', e);
        this.drawFallbackQr(ctx, room);
      }
    } else {
      this.drawFallbackQr(ctx, room);
    }

    // 二维码提示
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(hasUserQr ? '微信扫码 · 长按识别入群' : '微信扫码 · 即刻免费上车', 300, 640);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '18px sans-serif';
    ctx.fillText('无需下载 APP · 极简同城麻友搭子匹配', 300, 685);
    ctx.fillText('⚖️ 严禁赌博 · 同城文明休闲组局', 300, 725);

    return canvas.toDataURL('image/png');
  },

  drawFallbackQr(ctx, room) {
    let baseUrl = window.location.href.split('#')[0].split('?')[0];
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:') {
      baseUrl = 'https://mayu-where-ru.pages.dev/';
    }
    const targetUrl = `${baseUrl}?room=${room.id}`;
    
    // 二维码白底背板 (留白 Quiet Zone)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(205, 415, 190, 190);

    // 绘制二维码矩阵
    QRCode.drawToCanvas(ctx, targetUrl, 220, 430, 160);
  },

  async showPosterModal(room) {
    const dataUrl = await this.generateCanvasPoster(room);
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-card poster-modal">
        <h3>🀄 微信朋友圈组局海报</h3>
        <p style="font-size:0.85rem; color:var(--text-muted);">保存图片分享至朋友圈/微信群，快速招募同城麻友上车：</p>
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
