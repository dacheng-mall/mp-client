Page({
  onShow: function() {
    const user = wx.getStorageSync('user');
    const token = wx.getStorageSync('token');
    this.setData({
      src: `https://mp.idacheng.cn?autoId=${user.autoId}&token=${token}&r=${Math.random()}`
    })
  },
  onmessage: function(e) {
    console.log(e)
  },
  onload: function(e){
    console.log('load', e)
  },
  onerror: function(e){
    console.log('error', e)
  },
})