// js/store.js
const DEFAULT_ROOMS = []; // 清空测试用的发布信息

export const Store = {
  getRooms() {
    const local = localStorage.getItem('mahjong_rooms');
    if (!local) return DEFAULT_ROOMS;
    try {
      const parsed = JSON.parse(local);
      // 如果存有的数据是之前的测试数据 (ID 包含 room_100_merchant 或 room_101)，自动做一次强清
      if (Array.isArray(parsed) && parsed.some(r => r.id === 'room_100_merchant' || r.id === 'room_101')) {
        localStorage.removeItem('mahjong_rooms');
        return DEFAULT_ROOMS;
      }
      return parsed;
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
    return user ? JSON.parse(user) : {
      id: 'usr_me',
      name: '极简麻友',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Me',
      wechat: 'my_wx_8888',
      phone: '13899990000',
      fulfilledCount: 8,
      flakeCount: 0,
      isBanned: false,
      contacts: []
    };
  },

  saveUser(user) {
    localStorage.setItem('mahjong_user', JSON.stringify(user));
  }
};

