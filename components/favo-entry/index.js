import { getRoute } from "../../utils/util";
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
      // const scene = app.globalData.scene;
      const { scene } = wx.getLaunchOptionsSync();
      switch (scene) {
        case 1007:
        case 1008:
        case 1011:
        case 1013:
        case 1025: {
          const route = getRoute();
          // 
          if (
            route.path !== "pages/customPage/index?code=home" &&
            route.length === 1
          ) {
            this.setStatus(true);
          }
          break;
        }
        default: {
          this.setStatus(false);
        }
      }
    }
  },
  methods: {
    setStatus(bool) {
      this.setData({
        show: bool
      });
    },
    gohome() {
      wx.reLaunch({
        url: "/pages/customPage/index?code=home"
      });
    }
  }
});
