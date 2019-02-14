// pages/start/index.js

let timer;
Page({
  data: {
    animationData: {}
  },
  onShow() {
    const animation = wx.createAnimation({
      timingFunction: 'ease'
    });
    this.animation = animation;
    timer = setInterval(() => {
      animation.opacity(0.6).scale(1.2, 1.2).step({
        duration: 200
      });
      animation.opacity(1).scale(1, 1).step({
        duration: 200
      });
      this.setData({
        animationData: animation.export()
      });
    }, 600);
  },
  onUnload(){
    if(timer) {
      clearInterval(timer)
    }
  },
});
