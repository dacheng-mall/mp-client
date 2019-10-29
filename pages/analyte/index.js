Page({
  onShow: function() {
    const user = wx.getStorageSync('user');
    const token = wx.getStorageSync('token');

    if(user.roles && token){
      if(user.roles.indexOf('staff') !== -1 || user.roles.indexOf('excutive') !== -1){
        console.log(user.roles);
        this.setData({
          src: `https://mp.idacheng.cn?id=${user.id}&t=${token}`
        })
      }
    } else {
      wx.navigateBack(-1)
    }
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