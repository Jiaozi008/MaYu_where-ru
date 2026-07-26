// js/store.js
const DEFAULT_ROOMS = [];

export const Store = {
  // 生成当日接头暗语码（纯前端计算，稳定可重现，日期一变自动换码）
  generateSecretCode(roomId, playerIndex) {
    const colors = ['红', '蓝', '绿', '金', '银', '紫', '橙', '白'];
    const animals = ['虎', '龙', '凤', '鲤', '鹰', '狼', '熊', '豹'];
    const now = new Date();
    const bjDate = new Date(now.getTime() + (now.getTimezoneOffset() + 480) * 60000);
    const today = `${bjDate.getFullYear()}-${String(bjDate.getMonth() + 1).padStart(2, '0')}-${String(bjDate.getDate()).padStart(2, '0')}`;
    const seed = `${today}-${roomId}-${playerIndex}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    }
    const color = colors[hash % colors.length];
    const animal = animals[(hash >> 3) % animals.length];
    const digits = String(hash % 10000).padStart(4, '0');
    return `${color}${animal} · ${digits}`;
  },

  getRooms() {
    const local = localStorage.getItem('mahjong_rooms');
    if (!local) return DEFAULT_ROOMS;
    try {
      return JSON.parse(local);
    } catch (e) {
      return DEFAULT_ROOMS;
    }
  },

  saveRooms(rooms) {
    localStorage.setItem('mahjong_rooms', JSON.stringify(rooms));
  },

  addRoom(newRoom) {
    const rooms = this.getRooms();
    rooms.unshift(newRoom);
    this.saveRooms(rooms);
  },

  clearRooms() {
    localStorage.removeItem('mahjong_rooms');
  },

  getUser() {
    const user = localStorage.getItem('mahjong_user');
    if (user) {
      try {
        return JSON.parse(user);
      } catch (e) {}
    }
    const defaultUser = {
      id: 'usr_me',
      name: '极简麻友',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Me',
      wechat: '',
      phone: '',
      fulfilledCount: 0,
      flakeCount: 0,
      isBanned: false,
      contacts: []
    };
    this.saveUser(defaultUser);
    return defaultUser;
  },

  saveUser(user) {
    localStorage.setItem('mahjong_user', JSON.stringify(user));
  }
};

