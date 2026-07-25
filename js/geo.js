// js/geo.js
export const Geo = {
  currentArea: '科技园',
  locationType: 'IP', // 'IP' (静默保底) 或 'GPS' (授权精准)
  userCoords: { lat: 22.543099, lng: 113.954000 }, // 默认模拟经纬度 (深圳科技园)

  getAvailableAreas() {
    return ['全部商圈', '科技园', '后海/海岸城', '西丽', '车公庙', '华强北'];
  },

  async initIPLocation() {
    this.currentArea = '科技园';
    this.locationType = 'IP';
    return { area: this.currentArea, type: this.locationType };
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
          this.currentArea = '科技园'; 
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

  // 📍 判定是否进入约定棋牌室电子围栏 (默认 200 米范围内)
  isArrivedAtFence(targetLat = 22.543000, targetLng = 113.954000, radiusMeters = 200) {
    if (!this.userCoords) return false;
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
