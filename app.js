//app.js
import { get, post, setToken } from "./utils/request";

App({
  onLaunch: function(res) {
    console.log(' 被调用了')
    this.globalData.initState = res;
    setTimeout(() => {
      this.login();
    }, 1000)
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
    }// else {
    //   const url = (function(path, query) {
    //     const keys = Object.keys(query);
    //     if (keys.length > 0) {
    //       let _url = path;
    //       const _query = keys.map((key, i) => {
    //         if (i === 0) {
    //           return `?${key}=${query[key]}`;
    //         }
    //         return `&${key}=${query[key]}`;
    //       });
    //       return `/${_url}${_query}`;
    //     }
    //   })(path, query);
    //   wx.reLaunch({
    //     url
    //   });
    // }
  },
  globalData: {
    userInfo: null,
    openid: ""
  }
});
