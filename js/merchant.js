// js/merchant.js
export const Merchant = {
  sortMerchantRoomsFirst(rooms) {
    return [...rooms].sort((a, b) => (b.isMerchant ? 1 : 0) - (a.isMerchant ? 1 : 0));
  },

  renderBadge(room) {
    if (!room.isMerchant) return '';
    return `<span class="badge-merchant" style="background:linear-gradient(135deg, #ec4899, #8b5cf6); color:#fff; font-size:0.72rem; padding:2px 6px; border-radius:4px; font-weight:bold; margin-left:6px;">🏪 认证商家置顶</span>`;
  }
};
