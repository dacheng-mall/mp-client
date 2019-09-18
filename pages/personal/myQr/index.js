import { get, post } from "../../../utils/request";
import regeneratorRuntime from "../../../utils/regenerator-runtime/runtime";

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
  fetch: async function() {
    const user = wx.getStorageSync("user");
    const src = wx.getStorageSync("my-qr-code");
    if (!src && user) {
      try {
        const blob = await post("v1/api/wx/createWXAQRCode", {
          page: "pages/qrcode/list/index",
          scene: `?said=${user.autoId}`
        });
        wx.setStorageSync("my-qr-code", src);
        this.setData({
          src: `data:image/jpg;base64,${blob}`,
          avatar: user.avatar
        });
      } catch (e) {}
    } else if (user) {
      this.setData({
        src,
        avatar: user.avatar
      });
    }
  }
});
