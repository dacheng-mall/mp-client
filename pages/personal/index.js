import { get } from "../../utils/request";
import { uri, getRoute } from "../../utils/util";
import { source } from "../../setting";
import regeneratorRuntime from "../../utils/regenerator-runtime/runtime";

Page({
  data: {
    source,
    list: [
      {
        name: "我的礼品",
        icon: "gift-fill",
        iconColor: "#00bcbd",
        color: "#999",
        // path: "/pages/personal/myGift/index",
        path: "",
        userType: null
      },
      {
        name: "我的活动",
        icon: "thunderbolt-fill",
        iconColor: "#00bcbd",
        color: "#999",
        path: "",
        userType: 4
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
  onShow: async function() {
    const user = wx.getStorageSync("user");
    this.setData({
      user
    });
  },
  bindInst() {
    wx.removeStorageSync('bind_rootid')
    wx.removeStorageSync('bind_id')
    wx.removeStorageSync('bind_name')
    wx.navigateTo({
      url: "/pages/personal/bind/index"
    });
  }
});
