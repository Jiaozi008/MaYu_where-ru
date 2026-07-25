// js/nav.js
export const Nav = {
  openAmap(address) {
    const encoded = encodeURIComponent(address);
    // 高德地图 网页/App Universal URI 路线检索协议
    const url = `https://uri.amap.com/search?keyword=${encoded}`;
    const win = window.open(url, '_blank');
    if (!win) window.location.href = url;
  },

  openTencentMap(address) {
    const encoded = encodeURIComponent(address);
    // 腾讯地图 网页 Web URI 路线协议
    const url = `https://map.qq.com/m/index/map?keyword=${encoded}`;
    const win = window.open(url, '_blank');
    if (!win) window.location.href = url;
  },

  openBaiduMap(address) {
    const encoded = encodeURIComponent(address);
    // 百度地图 URI 路线搜索协议
    const url = `https://api.map.baidu.com/geocoder?address=${encoded}&output=html&src=mahjong_app`;
    const win = window.open(url, '_blank');
    if (!win) window.location.href = url;
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
          <button id="btn-baidu-map" class="btn-secondary" style="border-color:#ef4444; color:#f87171;">百度地图导航</button>
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

    modal.querySelector('#btn-baidu-map').onclick = () => {
      this.openBaiduMap(address);
      modal.remove();
    };

    modal.querySelector('#btn-close-nav').onclick = () => modal.remove();
  }
};

