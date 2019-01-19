//app.js
import { get, post, setToken } from "./utils/request";

App({
  onLaunch: function() {
    this.login();
  },
  goHome: function() {},
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
              // debugger
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
      userType: 2,
      password: "defaultPassword"
    };
    post("api/public/registerUser", body).then(res => {
      this.globalData.userInfo = res.user;
      this.afterLogin(res.user, res.token);
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
    wx.reLaunch({
      url: "/pages/customPage/index?code=home"
    });
  },
  globalData: {
    userInfo: null,
    openid: ""
  }
});
