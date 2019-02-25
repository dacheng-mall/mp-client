//app.js
import { get, post, setToken } from "./utils/request";

App({
  onLaunch: function(res) {
    this.globalData.initState = res;
    this.checkUpdate()
    setTimeout(() => {
      this.login();
    }, 1000)
    const {scene} = wx.getLaunchOptionsSync();
    this.globalData.scene = scene
    this.setNavHeight();
  },
  setNavHeight: function(){
    wx.getSystemInfo({
      success: res => {
        this.globalData.navHeight = res.statusBarHeight + 46;
      },
      fail(err) {
        console.log(err);
      }
    })
  },
  login: function() {
    wx.login({
      success: res => {
        get("api/wx/token_bycode", { code: res.code })
          .then(data => {
            this.globalData.openid = data.openid;
            if (data.user && data.token) {
              // 有用户信息, 已经注册过了
              this.afterLogin(data.user, data.token);
            } else {
              // 没注册过
              this.getUserInfo();
            }
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
    post("api/public/registerUser", body).then(res => {
      this.globalData.userInfo = res.user;
      this.afterLogin(res.user, res.token);
    }).catch(e => {
      console.log(e)
    });
  },
  getUserInfo: function() {
    wx.getUserInfo({
      success: res => {
        const { userInfo } = res;
        userInfo.openid = this.globalData.openid;
        this.register(userInfo);
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
    setToken(token);
    const { path, query } = this.globalData.initState;
    if (path === "pages/start/index") {
      
      wx.reLaunch({
        url: "/pages/customPage/index?code=home"
      });
    }
  },
  checkUpdate: function(){
    const updateManager = wx.getUpdateManager();
    // 检查是否有新版本
    updateManager.onCheckForUpdate(function (res) {
      if(res.hasUpdate) {
        // 如果有新版本就下载
        updateManager.onUpdateReady(function () {
          // 下载完成后强制更新
          wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好，是否重启应用？',
            success(r) {
              if (r.confirm) {
                // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                updateManager.applyUpdate();
              }
            }
          })
        })
      }
    })
  },
  globalData: {
    userInfo: null,
    openid: "",
    navHeight: 0
  }
});
