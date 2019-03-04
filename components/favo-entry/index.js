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
      const route = getRoute();
      if (
        route.path !== "pages/customPage/index?code=home" &&
        route.length === 1
      ) {
        this.setStatus(true);
      } else {
        this.setStatus(false);
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
