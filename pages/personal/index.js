import { get, setToken, put } from "../../utils/request";
import { notice } from "../../utils/util";
import { source } from "../../setting";
import regeneratorRuntime from "../../utils/regenerator-runtime/runtime";

const MENU = [
  {
    title: "经理人专区",
    userType: 4,
    split: 4,
    items: [
      {
        name: "我报名的活动",
        icon: "crown-fill",
        iconColor: "#00bcbd",
        color: "#fff",
        size: 2,
        path: "/pages/scroll/index?pageType=myActivities"
      },
      {
        name: "我的客户",
        icon: "team",
        iconColor: "#00bcbd",
        color: "#fff",
        size: 2,
        // path: "/pages/personal/myActivity/myCustomer"
        path: "/pages/scroll/index?pageType=myCustomers"
      },
      {
        name: "我送出的礼物(码)",
        icon: "qrcode",
        iconColor: "#ff3366",
        color: "#fff",
        size: 2,
        // path: "/pages/qrcode/list/index?type=salesman"
        path: "/pages/scroll/index?pageType=myQR"
      },
      {
        name: "我的机构",
        icon: "home",
        iconColor: "#ffb366",
        color: "#fff",
        size: 2,
        todo: "bindInst"
      }
    ]
  },
  {
    title: "通用",
    userType: null,
    split: 4,
    items: [
      {
        name: "抢购",
        icon: "trophy-fill",
        iconColor: "#ff4d4d",
        color: "#fff",
        path: "/pages/scroll/index?pageType=mySpeedKill"
      },
      {
        name: "预约",
        icon: "check-circle-fill",
        iconColor: "#00bcbd",
        color: "#fff",
        // path: "/pages/personal/myGift/index"
        path: "/pages/scroll/index?pageType=gift"
      },
      {
        name: "我的礼物",
        icon: "gift",
        iconColor: "#009899",
        color: "#fff",
        // path: "/pages/qrcode/list/index?type=user"
        path: "/pages/scroll/index?pageType=myQRGift"
      },
      {
        name: "加入机构",
        icon: "home",
        iconColor: "#ff6600",
        color: "#fff",
        userType: 2,
        todo: "bindInst"
      },
      {
        name: "退出机构",
        icon: "stop",
        iconColor: "#ccc",
        color: "#666",
        userType: 4,
        todo: "unbindInst"
      }
    ]
  }
];
Page({
  data: {
    source,
    timestamp: null,
    menu: [...MENU]
  },
  onShow: function() {
    const clear = wx.getStorageSync("clear");
    if (clear) {
      wx.clearStorageSync();
      this.setData({
        source,
        timestamp: null,
        user: null,
        menu: [...MENU]
      });
      return;
    }
    const ts = new Date().valueOf();
    const force = wx.getStorageSync("force");
    const lastTimestamp = wx.getStorageSync("lastTimestamp");
    const user = wx.getStorageSync("user");
    this.setData({
      menu: [...MENU]
    });
    wx.removeStorage({
      key: "force"
    });
    if (user && (force || !lastTimestamp || ts - lastTimestamp > 7200000)) {
      wx.startPullDownRefresh();
    } else if (user) {
      this.setData({
        user,
        menu: [...MENU]
      });
    }
  },
  todo: function(e) {
    const { type } = e.detail;
    if (type) {
      switch (type) {
        case "bindInst": {
          this.bindInst();
          break;
        }
        case "unbindInst": {
          this.unbindInst();
          break;
        }
      }
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
                wx.setStorageSync("lastTimestamp", new Date().valueOf());
                wx.setStorageSync("user", data.user);
                setToken(data.token);
                this.setData({
                  user: data.user,
                  menu: [...MENU]
                });
                resolve(data.user);
              } else {
                // 没注册过, 清缓存, 坐等app的注册
                wx.stopPullDownRefresh();
                const app = getApp();
                app._clear();
                notice({
                  content: "您还没有注册",
                  confirmText: "一键注册"
                });
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
  unbindInst: function() {
    const institutionName = this.data.user.institution.name;
    wx.showModal({
      title: "警告",
      content: `您确认要从 ${institutionName} 中退出吗?`,
      confirmText: "不退出",
      confirmColor: "green",
      cancelText: "退出",
      cancelColor: "#ccc",
      success: res => {
        if (!res.confirm) {
          quit();
        }
      }
    });
    async function quit() {
      const user = wx.getStorageSync("user");
      const data = await put("v1/api/sys/user", {
        id: user.id,
        institutionId: null,
        gradeId: null,
        gradeName: null,
        code: null,
        userType: 2
      });
      if (data) {
        wx.startPullDownRefresh();
      }
    }
  },
  login: function() {
    wx.navigateTo({
      url: "/pages/start/author"
    });
  },
  setting: function() {
    wx.navigateTo({
      url: "/pages/personal/setting/index"
    });
  }
});
