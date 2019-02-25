const app = getApp();
Component({
  properties: {
    iconName: {
      type: String,
      value: "home"
    }
  },
  data: {
    show: false
  },
  pageLifetimes: {
    show() {
      const scene = app.globalData.scene;
      switch(scene) {
        case 1007:
        case 1008:
        case 1011:
        case 1013:
        case 1025: {
          this.setData({
            show: true
          })
          break;
        }
        default: {
          this.setData({
            show: false
          })
        }
      }
    }
  },
  methods: {
    gohome(){
      wx.reLaunch({
        url: '/pages/customPage/index?code=home'
      })
    }
  }
});
