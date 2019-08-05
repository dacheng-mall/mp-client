//app.js
import { get, post, put, setToken, getToken } from "./utils/request";
import { uri, getRoute } from "./utils/util";
import { homePath } from "./setting";

App({
  onLaunch: function() {
    wx.getSystemInfo({
      // 获取设备信息
      success: res => {
        this.globalData.systeminfo = res;
      }
    });
    // 获得胶囊按钮位置信息
    this.globalData.headerBtnPosi = wx.getMenuButtonBoundingClientRect();
    this.checkIsIPhoneX();
  },
  onShow: function(res) {
    this.globalData.initState = res;
    const onShowTimer = setTimeout(() => {
      this.checkUpdate();
      clearTimeout(onShowTimer);
    }, 500);
  },
  checkIsIPhoneX: function() {
    const self = this;
    wx.getSystemInfo({
      success: function(res) {
        // 根据 model 进行判断
        if (/iPhone\sX/.test(res.model)) {
          self.globalData.isIPX = true;
          self.globalData.headerBtnPosi = {
            right: self.globalData.headerBtnPosi.right - 10,
            bottom: 82,
            height: 32,
            left: 317,
            top: 50,
            width: 87
          };
        }
      }
    });
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
      this.globalData.needReLaunch = true;
      wx.clearStorage({
        success: function() {
          if (callback instanceof Function) {
            callback();
          }
        }
      });
    } catch (e) {}
  },
  _login: function(force) {
    const user = wx.getStorageSync("user");
    const token = getToken();
    if (force) {
      this._clear();
    }
    if (!force && (user && token)) {
      if (!user.autoId) {
        // 如果没有autoId, 重新获取下
        this._clear(this._login);
      } else {
        this.afterLogin(user, token);
      }
      return;
    }
    wx.login({
      success: res => {
        get("api/wx/token_bycode", { code: res.code })
          .then(data => {
            this.globalData.openid = data.user ? data.user.openid : data.openid;
            this.getUserInfo(data);
            wx.setStorageSync("lastTimestamp", new Date().valueOf());
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
    const { openid, user, token, userInfo } = data;
    if (openid) {
      // 没注册过
      const { path } = getRoute();
      if (path !== "pages/start/author") {
        wx.navigateTo({
          url: "/pages/start/author"
        });
      }
    } else if (user && token) {
      // 注册过
      this.afterLogin(user, token);
    } else if (userInfo) {
      // 刚获取过用户信息, 注册
      userInfo.openid = this.globalData.openid;
      if (userInfo.openid) {
        this.register(userInfo);
      } else {
        // this._login();
      }
    }
    return;
  },
  goHome: function(cur) {
    // 如果当前页面不是首页, 那么跳转到首页
    if (cur !== homePath) {
      wx.reLaunch({
        url: `/${homePath}`
      });
    }
  },
  afterLogin: function(user, token) {
    this.globalData.userInfo = user;
    wx.setStorageSync("user", user);
    if (token) {
      setToken(token);
    }
    // path, query 是最初访问的小程序时的目标页面
    const { path, query } = this.globalData.initState;
    get("v1/api/sys/favorites/productIds", { userId: user.id }).then(res => {
      wx.setStorageSync("favorites", res);
    });
    const routes = getCurrentPages();
    if (routes.length > 0) {
      const cur = routes[routes.length - 1].route;
      if (
        cur === path &&
        (cur !== "pages/start/index" && cur !== "pages/start/author")
      ) {
        // 当前页面和预期页面相同, 且不是授权页面时
        // 如果401之后清理了storage, 那么重新加载, 否则不做任何事
        if (this.globalData.needReLaunch) {
          wx.reLaunch({
            url: uri(path, query, true)
          });
          this.globalData.needReLaunch = null;
        }
      } else if (
        cur === path &&
        (cur === "pages/start/index" || cur === "pages/start/author")
      ) {
        // 当前页面和预期页面相同, 且是授权页面或启动页时
        // 跳转活动页
        this.goHome(cur);
      } else if (
        cur !== path &&
        (path !== "pages/start/index" && path !== "pages/start/author")
      ) {
        // 当前页面和预期页面不同, 且是预期页面不是授权页面或启动页时
        // 跳转预期页面
        if (!this.globalData.dontJump) {
          wx.reLaunch({
            url: uri(path, query, true)
          });
        }
        delete this.globalData.dontJump;
      } else {
        this.goHome(cur);
      }
    } else {
      this.goHome();
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
