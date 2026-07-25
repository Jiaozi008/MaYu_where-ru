// js/store.js
const DEFAULT_ROOMS = [
  {
    id: 'room_mock_1',
    title: '【四川麻将】同城急缺2人血战到底·20分底',
    city: '深圳市',
    district: '南山区',
    area: '科技园商圈',
    address: '同城棋牌茶艺馆 302 包厢',
    distance: 0.8,
    ruleTag: '四川麻将',
    isMerchant: true,
    host: {
      id: 'usr_host_1',
      name: '胖哥棋牌',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Pangge',
      creditRate: 98,
      isGold: true,
      wechat: 'pangge_888',
      phone: '13911112222'
    },
    players: [
      { name: '胖哥棋牌', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Pangge', wechat: 'pangge_888', phone: '13911112222' },
      { name: '老张麻友', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Laozhang', wechat: 'laozhang_66', phone: '13933334444' }
    ],
    maxPlayers: 4,
    startTime: '今天 (07-25) 20:00-23:30',
    status: 'MATCHING'
  },
  {
    id: 'room_mock_2',
    title: '【广东鸡平胡】缺1人来推牌·新手欢迎',
    city: '深圳市',
    district: '福田区',
    area: '华强北商圈',
    address: '同城茶楼 2 楼',
    distance: 1.5,
    ruleTag: '广东鸡平胡',
    isMerchant: false,
    host: {
      id: 'usr_host_2',
      name: '阿强',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Aqiang',
      creditRate: 100,
      isGold: false,
      wechat: 'aqiang_999',
      phone: '13855556666'
    },
    players: [
      { name: '阿强', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Aqiang', wechat: 'aqiang_999', phone: '13855556666' },
      { name: '小红', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Xiaohong', wechat: 'xiaohong_88', phone: '13877778888' },
      { name: '大刘', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Daliu', wechat: 'daliu_77', phone: '13811119999' }
    ],
    maxPlayers: 4,
    startTime: '今天 (07-25) 21:00-00:00',
    status: 'MATCHING'
  }
];

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
    if (user) {
      try {
        const parsed = JSON.parse(user);
        // 如果旧缓存里含有历史测试数据 8 次，自动修正为 0 次
        if (parsed.fulfilledCount === 8) {
          parsed.fulfilledCount = 0;
          this.saveUser(parsed);
        }
        return parsed;
      } catch (e) {}
    }
    const defaultUser = {
      id: 'usr_me',
      name: '极简麻友',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Me',
      wechat: 'my_wx_8888',
      phone: '13899990000',
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

