// js/nav.js
export const Nav = {
  openAmap(address) {
    const encoded = encodeURIComponent(address);
    // 高德地图 Universal URI 路线/搜索协议
    const url = `https://uri.amap.com/marker?name=${encoded}&src=mahjong_app`;
    window.open(url, '_blank');
  },

  openTencentMap(address) {
    const encoded = encodeURIComponent(address);
    // 腾讯地图 Web URI 路线协议
    const url = `https://apis.map.qq.com/uri/v1/search?keyword=${encoded}&referer=mahjong_app`;
    window.open(url, '_blank');
  },

  showNavChoiceModal(address) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-card">
        <h3>🗺️ 选择地图拉起路线导航</h3>
        <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:16px;">
          目的地：<strong>${address}</strong>
        </p>
        <div style="display:flex; flex-direction:column; gap:10px;">
          <button id="btn-amap" class="btn-primary" style="background:linear-gradient(135deg, #0284c7, #0369a1);">高德地图导航 (推荐)</button>
          <button id="btn-tencent-map" class="btn-secondary" style="border-color:#0284c7; color:#38bdf8;">腾讯地图导航</button>
        </div>
        <div class="modal-actions" style="margin-top:16px;">
          <button id="btn-close-nav" class="btn-secondary">取消</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('#btn-amap').onclick = () => {
      this.openAmap(address);
      modal.remove();
    };

    modal.querySelector('#btn-tencent-map').onclick = () => {
      this.openTencentMap(address);
      modal.remove();
    };

    modal.querySelector('#btn-close-nav').onclick = () => modal.remove();
  }
};
