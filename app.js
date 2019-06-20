//app.js
import { get, post, put, setToken, getToken } from "./utils/request";
import { uri } from "./utils/util";

App({
  onShow: function(res) {
    this.globalData.initState = res;
    this.checkUpdate();
  },
  setNavHeight: function() {
    wx.getSystemInfo({
      success: res => {
        this.globalData.navHeight = res.statusBarHeight + 46;
      },
      fail(err) {
        console.log(JSON.stringify(err));
      }
    });
  },
  _clear: function(callback) {
    try {
      wx.clearStorage({
        success: function() {
          if (callback instanceof Function) {
            callback();
          }
        }
      });
    } catch (e) {}
  },
  _login: function() {
    wx.login({
      success: res => {
        get("api/wx/token_bycode", { code: res.code })
          .then(data => {
            this.globalData.openid = data.openid;
            this.getUserInfo(data);
          })
          .catch(err => console.log("----", err));
      }
    });
  },
  register: function(value) {
    const { nickName: name, avatarUrl: avatar, gender, openid: openId } = value;
    const body = {
      name,
      avatar,
      gender,
      openId,
      username: openId,
      userType: 2,
      status: 1,
      password: "defaultPassword"
    };
    post("api/public/registerUser", body)
      .then(res => {
        this.globalData.userInfo = res.user;
        this.afterLogin(res.user, res.token);
      })
      .catch(e => {
        console.log(e);
      });
  },
  getUserInfo: function(data) {
    wx.getUserInfo({
      success: res => {
        if (data && data.user && data.token) {
          // 有用户信息, 已经注册过了, 依然获取用户最新的信息
          const { nickName: name, avatarUrl: avatar, gender } = res.userInfo;
          if (
            data.user.name !== name ||
            data.user.avatar !== avatar ||
            data.user.gender !== gender
          ) {
            put("api/sys/user", {
              id: data.user.id,
              name,
              gender,
              avatar
            })
              .then(res => {
                this.globalData.userInfo = res;
                this.afterLogin(res, data.token);
              })
              .catch(() => {
                this.afterLogin(data.user, data.token);
              });
          } else {
            this.afterLogin(data.user, data.token);
          }
        } else {
          const { userInfo } = res;
          userInfo.openid = this.globalData.openid;
          if (userInfo.openid) {
            this.register(userInfo);
          }
        }
      },
      fail: () => {
        wx.reLaunch({
          url: "/pages/start/author"
        });
      }
    });
  },
  afterLogin: function(user, token) {
    this.globalData.userInfo = user;
    wx.setStorageSync("user", user);
    if (token) {
      setToken(token);
    }
    // path, query 是最初访问的小程序时的目标页面
    const { path, query } = this.globalData.initState;
    get("api/sys/favorites/productIds", { userId: user.id }).then(res => {
      wx.setStorageSync("favorites", res);
    });
    const routes = getCurrentPages();
    if (routes.length > 0) {
      const cur = routes[routes.length - 1].route;
      if (
        (cur === "pages/start/index" || cur === "pages/start/author") &&
        (path !== "pages/start/index" && path !== "pages/start/author")
      ) {
        wx.reLaunch({
          url: uri(path, query, true)
        });
      } else {
        wx.reLaunch({
          url: "/pages/activity/index"
        });
      }
    } else {
      wx.reLaunch({
        url: "/pages/activity/index"
      });
      return;
    }
  },
  checkUpdate: function() {
    const updateManager = wx.getUpdateManager();
    const that = this;
    // 检查是否有新版本
    updateManager.onCheckForUpdate(function(res) {
      if (res.hasUpdate) {
        // 如果有新版本就下载
        updateManager.onUpdateReady(function() {
          // 下载完成后强制更新
          wx.showModal({
            title: "更新提示",
            content: "新版本已经准备好，是否重启应用？",
            success(r) {
              if (r.confirm) {
                // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                updateManager.applyUpdate();
              }
            }
          });
        });
        updateManager.onUpdateFailed(function() {
          wx.showModal({
            title: "抱歉! 新版本程序下载失败!",
            content:
              "请将当前小程序删除, 重新搜索小程序'礼全有', 并点击安装即可!",
            confirmText: "我知道了"
          });
        });
      } else {
        const { scene } = wx.getLaunchOptionsSync();
        that.globalData.scene = scene;
        that.setNavHeight();
        that._login();
      }
    });
  },
  globalData: {
    userInfo: null,
    openid: "",
    navHeight: 0
  }
});
