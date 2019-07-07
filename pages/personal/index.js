import { get } from "../../utils/request";
import { uri, getRoute } from "../../utils/util";
import { source } from "../../setting";
import regeneratorRuntime from "../../utils/regenerator-runtime/runtime";

let timer = null;

Page({
  data: {
    source,
    list: [
      {
        name: "我的礼品",
        icon: "gift-fill",
        iconColor: "#00bcbd",
        color: "#999",
        path: "/pages/personal/myGift/index",
        userType: null
      },
      {
        name: "我的活动",
        icon: "thunderbolt-fill",
        iconColor: "#00bcbd",
        color: "#999",
        path: "/pages/personal/myActivity/index",
        userType: 4
      },
      {
        name: "我发放的码",
        icon: "qrcode",
        iconColor: "#ff3366",
        color: "#999",
        path: "/pages/qrcode/list/index?type=salesman",
        userType: 4
      },
      {
        name: "我领取的码",
        icon: "qrcode",
        iconColor: "#00bcbd",
        color: "#999",
        path: "/pages/qrcode/list/index?type=user",
        userType: null
      },
      {
        name: "我的机构",
        icon: "info-circle-fill",
        iconColor: "#00bcbd",
        color: "#999",
        path: "",
        userType: 4
      }
    ]
  },
  onShow: function() {
    const user = wx.getStorageSync("user");
    const timestamp = new Date().valueOf();
    if (
      !this.data.timestamp ||
      !user ||
      timestamp - this.data.timestamp > 7200000
    ) {
      timer = setInterval(this.getUser, 1000);
    }
  },
  getUser: function() {
    const user = wx.getStorageSync("user");
    if (user) {
      const timestamp = new Date().valueOf();
      this.setData({
        user,
        timestamp
      });
      clearInterval(timer);
      timer = null;
    }
  },
  bindInst() {
    wx.removeStorageSync("bind_rootid");
    wx.removeStorageSync("bind_id");
    wx.removeStorageSync("bind_name");
    wx.navigateTo({
      url: "/pages/personal/bind/index"
    });
  }
});
