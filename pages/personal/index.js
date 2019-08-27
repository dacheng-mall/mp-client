import { get, setToken } from "../../utils/request";
import { uri, getRoute } from "../../utils/util";
import { source } from "../../setting";
import regeneratorRuntime from "../../utils/regenerator-runtime/runtime";

const MENU = [
  {
    title: "经理人专区",
    userType: 4,
    items: [
      {
        name: "活动",
        icon: "crown-fill",
        iconColor: "#00bcbd",
        color: "#fff",
        path: "/pages/personal/myActivity/index"
      },
      {
        name: "客户",
        icon: "team",
        iconColor: "#00bcbd",
        color: "#fff",
        path: "/pages/personal/myActivity/myCustomer"
      },
      {
        name: "我的码",
        icon: "qrcode",
        iconColor: "#ff3366",
        color: "#fff",
        path: "/pages/qrcode/list/index?type=salesman"
      }
    ]
  },
  {
    title: "活动专区",
    userType: null,
    items: [
      {
        name: "抢购",
        icon: "trophy-fill",
        iconColor: "#ff4d4d",
        color: "#fff",
        path: "/pages/personal/mySpeedKill/index"
      },
      {
        name: "预约",
        icon: "check-circle-fill",
        iconColor: "#00bcbd",
        color: "#fff",
        path: "/pages/personal/myGift/index"
      },
      {
        name: "我的码",
        icon: "qrcode",
        iconColor: "#009899",
        color: "#fff",
        path: "/pages/qrcode/list/index?type=user"
      }
    ]
  }
];
Page({
  data: {
    source,
    timestamp: null,
    menu: MENU
  },
  onShow: function() {
    const ts = new Date().valueOf();
    const force = wx.getStorageSync("force");
    const lastTimestamp = wx.getStorageSync("lastTimestamp");
    const user = wx.getStorageSync("user");
    if (!user || user.userType === 2) {
      const menu = MENU.filter(({ userType }) => !userType);
      this.setData({
        menu
      });
    } else {
      this.setData({
        menu: [...MENU]
      });
    }
    wx.removeStorage({
      key: "force"
    });
    if (user && (force || !lastTimestamp || ts - lastTimestamp > 7200000)) {
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
                wx.stopPullDownRefresh();
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
  },
  login: function() {
    wx.navigateTo({
      url: "/pages/start/author"
    });
  }
});
