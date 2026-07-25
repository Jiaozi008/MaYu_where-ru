// js/rules.js
export const Rules = {
  ruleTypes: ['全部玩法', '四川血战', '广东鸡平胡', '红中换三张', '长沙麻将', '大众麻将'],

  getAllRuleTypes() {
    return this.ruleTypes;
  },

  filterRoomsByRule(rooms, ruleType) {
    if (!ruleType || ruleType === '全部玩法') return rooms;
    return rooms.filter(room => (room.ruleTag && room.ruleTag === ruleType) || room.title.includes(ruleType));
  }
};
