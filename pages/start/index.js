// pages/start/index.js

let timer;
let timer2;
Page({
  data: {
    animationData: {}
  },
  onShow() {
    const animation = wx.createAnimation({
      timingFunction: "ease"
    });
    this.animation = animation;
    timer = setInterval(() => {
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
          url: "/pages/home/index"
        });
      }, 1000);
    }
  },
  onUnload() {
    if (timer) {
      clearInterval(timer);
    }
    if (timer2) {
      clearTimeout(timer2);
    }
  }
});
