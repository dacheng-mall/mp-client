// pages/start/index.js

Page({
  data: {
    animationData: {}
  },
  onShow() {
    const animation = wx.createAnimation({
      timingFunction: "ease"
    });
    this.animation = animation;
    this.timer = setInterval(() => {
      animation
        .opacity(0.6)
        .scale(1.2, 1.2)
        .step({
          duration: 200
        });
      animation
        .opacity(1)
        .scale(1, 1)
        .step({
          duration: 200
        });
      this.setData({
        animationData: animation.export()
      });
    }, 600);
    const { id } = wx.getStorageSync("user");
    if (id) {
      setTimeout(() => {
        wx.reLaunch({
          url: "/pages/activity/index"
        });
      }, 1000);
    }
  },
  onUnload() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
});
