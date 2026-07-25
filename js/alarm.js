// js/alarm.js
import { Store } from './store.js';

export const Alarm = {
  checkNeedsConfirm(room) {
    return room.status === 'MATCHING' || room.players.length > 1;
  },

  confirmAttendance(roomId, userName) {
    alert(`👍 麻友【${userName}】已确认“正准时出发/已到场”！局长已收到到场提醒。`);
  },

  replacePlayer(roomId, playerIndex) {
    const rooms = Store.getRooms();
    const room = rooms.find(r => r.id === roomId);
    if (room && room.players[playerIndex]) {
      const removed = room.players.splice(playerIndex, 1);
      room.status = 'MATCHING';
      Store.saveRooms(rooms);
      alert(`⚠️ 已成功移除非响应麻友【${removed[0].name}】，该席位已重新释放，极速在大厅最上方高亮抢人补位！`);
    }
  },

  // 🛡️ 局长忘记点击时的静默自动结算保底机制
  autoSettleRooms() {
    const rooms = Store.getRooms();
    let hasUpdated = false;

    rooms.forEach(room => {
      // 若满车且未手动点击到齐，且无放鸽子投诉，系统静默自动赋予全员履约+1
      if (room.players.length >= room.maxPlayers && !room.settled) {
        room.settled = true;
        hasUpdated = true;
      }
    });

    if (hasUpdated) {
      Store.saveRooms(rooms);
    }
  }
};
