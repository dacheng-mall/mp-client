const app = getApp();

Page({
  data: {
    canIUse: wx.canIUse("button.open-type.getUserInfo")
  },
  bindGetUserInfo: function(e) {
    if (e.detail.userInfo) {
      //用户按了允许授权按钮
      app.globalData.userInfo = e.detail.userInfo;
      app.getUserInfo(e.detail);
    } else {
      //用户按了拒绝按钮
    }
  },
  back: function() {
    wx.navigateBack();
  }
});
