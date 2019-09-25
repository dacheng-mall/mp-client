const TYPES = {
  activity: {
    api: "v1/api/sys/activity",
    query: { status: 1 },
    pagination: { page: 1, pageSize: 8 },
    title: "活动",
    name: "activity"
  },
  mySpeedKill: {
    api: "v1/api/sys/giftProduct",
    query: { customId: "user_id", type: "seckill", notEmpty: 1 },
    pagination: { page: 1, pageSize: 8 },
    title: "我的奖品",
    name: "myGift"
  },
  gift: {
    api: "v1/api/sys/giftProduct",
    query: { customId: "user_id", type: "none" },
    pagination: { page: 1, pageSize: 8 },
    title: "我的预约",
    name: "myGift"
  },
  myActivities: {
    api: "v1/api/sys/activitySalesmen",
    query: { salesmanId: "user_id" },
    pagination: { page: 1, pageSize: 8 },
    title: "我的活动",
    name: "myActivities"
  },
  myCustomers: {
    api: "v1/api/sys/giftProduct",
    query: { salesmanId: "user_id" },
    pagination: { page: 1, pageSize: 8 },
    title: "我的客户",
    name: "myGift"
  },
  // gift: {
  //   api: "v1/api/sys/giftProduct",
  //   query: { customId: "user_id", type: 'none' },
  //   pagination: { page: 1, pageSize: 8 },
  //   title: "我的预约",
  //   name: "giftProduct"
  // },
  myQR: {
    api: "v1/api/sys/qr",
    query: { salesmanId: "user_id", hasCustom: 1 },
    pagination: { page: 1, pageSize: 8 },
    title: "我送出的礼物",
    name: "qr"
  },
  myQRGift: {
    api: "v1/api/sys/qr",
    query: { userId: "user_id" },
    pagination: { page: 1, pageSize: 8 },
    title: "我的礼物",
    name: "qr"
  }
};
export function types(typeName) {
  if (TYPES[typeName]) {
    const res = { ...TYPES[typeName] };
    if (res.query) {
      // 浅拷贝查询参数
      res.query = { ...res.query };
      // 如果有默认查询参数
      for (let key in res.query) {
        // 则遍历参数
        if (res.query.hasOwnProperty(key)) {
          if (res.query[key] === "user_id") {
            // 如果有参数的值是"user_id", 则获取当前用户信息
            const user = wx.getStorageSync("user");
            if (user && user.id) {
              // 如果有用户信息, 则替换user.id为真实用户id
              res.query[key] = user.id;
            }
            // 否则无作为
          }
        }
      }
    }
    // 最终返回浅拷贝的类型对象
    return res;
  }
  return null;
}
