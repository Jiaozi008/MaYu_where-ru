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
    canvas.height = 860;
    const ctx = canvas.getContext('2d');

    const maxP = room.maxPlayers || 4;
    const currentP = room.players ? room.players.length : 0;
    const missingCount = Math.max(0, maxP - currentP);

    // 1. 绘制国潮夜间暗金背景
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 600, 860);

    // 2. 边框装饰
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 6;
    ctx.strokeRect(20, 20, 560, 820);

    // 3. 动态标语（根据剩余缺人情况自动变幻）
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 34px sans-serif';
    ctx.textAlign = 'center';
    const topTitle = missingCount > 0 ? `🀄 麻友，你在哪儿？急缺 ${missingCount} 人！` : `🀄 麻友聚局 · 人数已齐备开！`;
    ctx.fillText(topTitle, 300, 80);

    // 4. 房间详情
    ctx.textAlign = 'left';
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(`【${room.title}】`, 45, 140);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '20px sans-serif';
    ctx.fillText(`📍 地点：[${room.district || ''}·${room.area || ''}] ${room.address || ''}`, 45, 185);
    ctx.fillText(`⏰ 时间：${room.startTime || ''}`, 45, 225);
    ctx.fillText(`👤 局长：${room.host ? room.host.name : '麻友'} (${(room.host && room.host.isGold) ? '⚡黄金麻友' : '守时保证'})`, 45, 265);

    // 5. 分隔线 1
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(45, 295);
    ctx.lineTo(555, 295);
    ctx.stroke();

    // 6. 动态车况提示
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(`当前车况：已上车 ${currentP} 人，${missingCount > 0 ? `还差 ${missingCount} 人！` : '席位已满！'}`, 45, 330);

    // 7. 动态 4 格席位图渲染（加载已上车麻友真实头像与虚位以待画框）
    const seatsY = 355;
    const seatWidth = 110;
    const seatGap = 18;
    const startX = 45;

    const avatarImages = await Promise.all((room.players || []).map(p => new Promise(resolve => {
      if (!p || !p.avatar) return resolve(null);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = p.avatar;
    })));

    for (let i = 0; i < maxP; i++) {
      const seatX = startX + i * (seatWidth + seatGap);
      const player = room.players ? room.players[i] : null;
      const avatarImg = avatarImages[i];

      if (player) {
        // 已有麻友上车
        ctx.fillStyle = 'rgba(7, 193, 96, 0.12)';
        ctx.strokeStyle = '#07c160';
        ctx.lineWidth = 2;
        this.drawRoundRect(ctx, seatX, seatsY, seatWidth, 110, 8);
        ctx.fill();
        ctx.stroke();

        if (avatarImg) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(seatX + seatWidth / 2, seatsY + 40, 24, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(avatarImg, seatX + seatWidth / 2 - 24, seatsY + 16, 48, 48);
          ctx.restore();
        } else {
          ctx.fillStyle = '#07c160';
          ctx.font = 'bold 24px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(player.name ? player.name[0] : '麻', seatX + seatWidth / 2, seatsY + 48);
        }

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'center';
        const displayName = player.name ? (player.name.length > 5 ? player.name.slice(0, 4) + '..' : player.name) : '麻友';
        ctx.fillText(displayName, seatX + seatWidth / 2, seatsY + 95);
      } else {
        // 虚位以待：金色虚线框
        ctx.fillStyle = 'rgba(251, 191, 36, 0.05)';
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 4]);
        this.drawRoundRect(ctx, seatX, seatsY, seatWidth, 110, 8);
        ctx.fill();
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('?', seatX + seatWidth / 2, seatsY + 48);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('虚位以待', seatX + seatWidth / 2, seatsY + 95);
      }
    }

    // 8. 分隔线 2
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(45, 485);
    ctx.lineTo(555, 485);
    ctx.stroke();

    // 9. 绘制二维码区域：优先绘制局长上传的微信群二维码图片
    const userQrImage = room.wechatGroupQr || (room.wechatGroupUrl && room.wechatGroupUrl.startsWith('data:image') ? room.wechatGroupUrl : null);
    let hasUserQr = false;

    if (userQrImage) {
      try {
        await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(210, 505, 180, 180);
            ctx.drawImage(img, 218, 513, 164, 164);
            hasUserQr = true;
            resolve();
          };
          img.onerror = reject;
          img.src = userQrImage;
        });
      } catch (e) {
        console.warn('局长微信群二维码绘制失败，回退为网页算法二维码', e);
        this.drawFallbackQr(ctx, room, 210, 505);
      }
    } else {
      this.drawFallbackQr(ctx, room, 210, 505);
    }

    // 10. 二维码下方文本标语
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 25px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(hasUserQr ? '微信扫码 · 长按识别入群' : '微信扫码 · 即刻免费上车', 300, 720);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '18px sans-serif';
    ctx.fillText('无需下载 APP · 极简同城麻友搭子匹配', 300, 760);
    ctx.fillText('⚖️ 严禁赌博 · 同城文明休闲组局', 300, 800);

    return canvas.toDataURL('image/png');
  },

  drawRoundRect(ctx, x, y, width, height, radius) {
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, radius);
    } else {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    }
  },

  drawFallbackQr(ctx, room, x = 210, y = 505) {
    let baseUrl = window.location.href.split('#')[0].split('?')[0];
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:') {
      baseUrl = 'https://mayu-where-ru.pages.dev/';
    }
    const targetUrl = `${baseUrl}?room=${room.id}`;
    
    // 二维码白底背板 (留白 Quiet Zone)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, y, 180, 180);

    // 绘制二维码矩阵
    QRCode.drawToCanvas(ctx, targetUrl, x + 10, y + 10, 160);
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
