// js/geo.js
export const Geo = {
  currentCity: '自动定位中...',
  currentArea: '同城中心',
  locationType: 'IP', // 'IP' (静默保底) 或 'GPS' (授权精准)
  userCoords: { lat: 22.543099, lng: 113.954000 },

  getCurrentArea() {
    return this.currentArea || '同城中心';
  },

  getCurrentCity() {
    return this.currentCity || '同城';
  },

  getAvailableAreas() {
    // 通用商圈分类 (适用于全国任意城市)
    const universalAreas = ['全部商圈', '同城中心', 'CBD核心区', '大学城/学府区', '热门商业街', '近郊/社区'];
    
    // 动态结合当前检测到的商圈
    if (this.currentArea && !universalAreas.includes(this.currentArea)) {
      universalAreas.splice(1, 0, this.currentArea);
    }

    // 从已有已发布的房间中动态收集商圈名称
    try {
      const { Store } = require('./store.js'); // 或者运行时动态读取 localStorage
      const local = localStorage.getItem('mahjong_rooms');
      if (local) {
        const rooms = JSON.parse(local);
        if (Array.isArray(rooms)) {
          rooms.forEach(r => {
            if (r.area && !universalAreas.includes(r.area)) {
              universalAreas.push(r.area);
            }
          });
        }
      }
    } catch (e) {
      // 忽略读取异常
    }

    return Array.from(new Set(universalAreas));
  },

  async initIPLocation() {
    this.locationType = 'IP';
    try {
      // 尝试免 API Key 动态 IP 定位服务
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const resp = await fetch('https://ipapi.co/json/', { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (resp.ok) {
        const data = await resp.json();
        if (data && (data.city || data.region)) {
          this.currentCity = data.city || data.region || '同城';
          this.currentArea = data.district || data.city || '同城中心';
          if (data.latitude && data.longitude) {
            this.userCoords = { lat: data.latitude, lng: data.longitude };
          }
          return { area: this.currentArea, city: this.currentCity, type: this.locationType };
        }
      }
    } catch (e) {
      console.warn('IP 自动识别使用默认保底:', e);
    }

    // 静默保底
    this.currentCity = '同城';
    this.currentArea = '同城中心';
    return { area: this.currentArea, city: this.currentCity, type: this.locationType };
  },

  requestGPSUpgrade() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ success: false, reason: '浏览器不支持 GPS 定位' });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          this.locationType = 'GPS';
          this.currentArea = 'GPS精准商圈'; 
          resolve({ success: true, type: 'GPS', coords: this.userCoords, area: this.currentArea });
        },
        (error) => {
          console.warn('GPS 授权未允许，保持 IP 静默保底:', error.message);
          resolve({ success: false, reason: '用户未授权', fallback: 'IP' });
        },
        { timeout: 5000, maximumAge: 60000 }
      );
    });
  },

  // 📍 算法：计算两点经纬度的哈夫斯海姆距离 (单位: 米)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // 地球半径(米)
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // 返回距离(米)
  },

  // 📍 判定是否进入约定棋牌室电子围栏 (仅在 GPS 授权开启且目标坐标有效时判定，默认 200 米范围内)
  isArrivedAtFence(targetLat, targetLng, radiusMeters = 200) {
    if (!this.userCoords || this.locationType !== 'GPS' || targetLat == null || targetLng == null) {
      return { arrived: false, distanceMeters: 9999 };
    }
    const dist = this.calculateDistance(this.userCoords.lat, this.userCoords.lng, targetLat, targetLng);
    return {
      arrived: dist <= radiusMeters,
      distanceMeters: Math.round(dist)
    };
  },

  filterRoomsByArea(rooms, selectedArea) {
    if (!selectedArea || selectedArea === '全部商圈') {
      return rooms;
    }
    return rooms.filter(room => room.area === selectedArea);
  }
};

