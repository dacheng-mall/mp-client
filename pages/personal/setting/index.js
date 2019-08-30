import {version} from '../../../setting'
Page({
  data: {
    version
  },
  logout: function(){
    wx.clearStorageSync();
    wx.switchTab({
      url: '/pages/personal/index'
    })
  },
  checkUpdate: function(){
    const app = getApp();
    if(app.checkUpdate instanceof Function) {
      app.checkUpdate(true)
    }
  }
})