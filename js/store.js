// js/store.js
const DEFAULT_ROOMS = [
  {
    id: 'room_100_merchant',
    title: '四川血战·30分底·包厢特惠茶水',
    city: '深圳市',
    district: '南山区',
    area: '科技园',
    address: '胖子棋牌旗舰店 101尊享包',
    distance: 0.5,
    ruleTag: '四川血战',
    isMerchant: true,
    host: { id: 'usr_boss', name: '胖老板娘(官方)', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Boss', creditRate: 100, isGold: true, wechat: 'pang_boss_mj', phone: '13888880000' },
    players: [
      { name: '胖老板娘(官方)', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Boss', wechat: 'pang_boss_mj', phone: '13888880000' }
    ],
    maxPlayers: 4,
    startTime: '今天 19:00',
    status: 'MATCHING'
  },
  {
    id: 'room_101',
    title: '四川血战·25分底·急缺1人',
    city: '深圳市',
    district: '南山区',
    area: '科技园',
    address: '胖子棋牌室 3号包厢',
    distance: 1.2,
    ruleTag: '四川血战',
    isMerchant: false,
    host: { id: 'usr_pang', name: '老麻枪胖哥', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Pangge', creditRate: 98, isGold: true, wechat: 'pangge_mahjong88', phone: '13800138001' },
    players: [
      { name: '老麻枪胖哥', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Pangge', wechat: 'pangge_mahjong88', phone: '13800138001' },
      { name: '小张麻友', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Zhang', wechat: 'zhang_mj2026', phone: '13912345678' },
      { name: '阿强哥', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Qiang', wechat: 'aqiang_sz', phone: '13788889999' }
    ],
    maxPlayers: 4,
    startTime: '今天 19:30',
    status: 'MATCHING'
  },
  {
    id: 'room_102',
    title: '广东鸡平胡·10分·二缺二',
    city: '深圳市',
    district: '南山区',
    area: '后海/海岸城',
    address: '雀友会馆 201室',
    distance: 2.5,
    ruleTag: '广东鸡平胡',
    isMerchant: false,
    host: { id: 'usr_ling', name: '后海麻后', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Ling', creditRate: 100, isGold: true, wechat: 'houhai_ling', phone: '13666667777' },
    players: [
      { name: '后海麻后', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Ling', wechat: 'houhai_ling', phone: '13666667777' },
      { name: '小李', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Lee', wechat: 'lee_mj_sz', phone: '13555554444' }
    ],
    maxPlayers: 4,
    startTime: '今天 20:00',
    status: 'MATCHING'
  },
  {
    id: 'room_103',
    title: '红中换三张·血流成河·满车速开',
    city: '深圳市',
    district: '南山区',
    area: '西丽',
    address: '大学城乐娱棋牌 888包',
    distance: 0.8,
    ruleTag: '红中换三张',
    isMerchant: false,
    host: { id: 'usr_chuan', name: '川麻雀圣', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Chuan', creditRate: 99, isGold: true, wechat: 'chuan_mj', phone: '13111112222' },
    players: [
      { name: '川麻雀圣', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Chuan', wechat: 'chuan_mj', phone: '13111112222' },
      { name: '妹子爱打牌', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Girl', wechat: 'girl_mj', phone: '13222223333' },
      { name: '老王哥', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Wang', wechat: 'wang_mj', phone: '13333334444' },
      { name: '小赵', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Zhao', wechat: 'zhao_mj', phone: '13444445555' }
    ],
    maxPlayers: 4,
    startTime: '今天 18:00',
    status: 'FULL'
  }
];

export const Store = {
  getRooms() {
    const local = localStorage.getItem('mahjong_rooms');
    return local ? JSON.parse(local) : DEFAULT_ROOMS;
  },

  saveRooms(rooms) {
    localStorage.setItem('mahjong_rooms', JSON.stringify(rooms));
  },

  addRoom(newRoom) {
    const rooms = this.getRooms();
    rooms.unshift(newRoom);
    this.saveRooms(rooms);
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
