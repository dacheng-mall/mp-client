import { get, setToken } from "../../utils/request";
import { uri, getRoute } from "../../utils/util";
import { source } from "../../setting";
import regeneratorRuntime from "../../utils/regenerator-runtime/runtime";

Page({
  data: {
    source,
    timestamp: null,
    list: [
      {
        name: "我的预约",
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
        name: "我送出的礼物",
        icon: "qrcode",
        iconColor: "#ff3366",
        color: "#999",
        path: "/pages/qrcode/list/index?type=salesman",
        userType: 4
      },
      {
        name: "我领取的礼物",
        icon: "qrcode",
        iconColor: "#00bcbd",
        color: "#999",
        path: "/pages/qrcode/list/index?type=user",
        userType: null
      }
    ]
  },
  onShow: function() {
    const ts = new Date().valueOf();
    const force = wx.getStorageSync("force");
    const lastTimestamp = wx.getStorageSync("lastTimestamp");
    const user = wx.getStorageSync("user");
    wx.removeStorage({
      key: "force"
    });
    if (force || !lastTimestamp || ts - lastTimestamp > 7200000) {
      wx.startPullDownRefresh();
    } else if (user) {
      this.setData({
        user
      });
    }
  },
  fetch: function() {
    return new Promise((resolve, rej) => {
      wx.login({
        success: res => {
          get("api/wx/token_bycode", { code: res.code })
            .then(data => {
              if (data.user) {
                // 注册过的, 用数据库的最新数据渲染页面
                this.setData({
                  user: data.user
                });
                wx.setStorageSync("lastTimestamp", new Date().valueOf());
                wx.setStorageSync("user", data.user);
                setToken(data.token);
                resolve(data.user);
              } else {
                // 没注册过, 请缓存, 坐等app的注册
                const app = getApp();
                app._clear();
              }
            })
            .catch(err => rej(err));
        }
      });
    });
  },
  onPullDownRefresh: function() {
    this.fetch()
      .then(() => {
        wx.stopPullDownRefresh();
      })
      .catch(err => {
        wx.stopPullDownRefresh();
        wx.showToast(err);
      });
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
