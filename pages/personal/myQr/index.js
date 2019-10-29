Page({
  data: {
    nvabarData: {
      showCapsule: 1, // 是否显示左上角图标   1表示显示    0表示不显示
      title: "身份码",
      textColor: "#fff", // 标题颜色
      bgColor: "#00bcbd", // 导航栏背景颜色
      btnBgColor: "#459d9f", // 胶囊按钮背景颜色
      iconColor: "white", // icon颜色 black/white
      borderColor: "rgba(255, 255, 255, 0.3)" // 边框颜色 格式为 rgba()，透明度为0.3
    },
    src: false
  },
  onLoad: function() {
    this.fetch();
  },
  fetch: function() {
    const user = wx.getStorageSync("user");
    if (user) {
      this.setData({
        scene: `https://mp.liquanyou.cn?autoId=${user.autoId}&type=personal`,
        avatar: user.avatar
      })
    } else if (user.qrcode) {
      this.setData({
        src: user.qrcode,
        avatar: user.avatar
      });
    }
  }
});
