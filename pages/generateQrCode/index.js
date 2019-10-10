import regeneratorRuntime from "../../utils/regenerator-runtime/runtime";

Page({
  onShow: async function() {
    const { options } = this;
    const scene = {};
    if (options.timestamp === "undefined") {
      scene.timestamp = new Date().valueOf();
    }
    if (options.location === "undefined") {
      const res = await this.getLocation();
    }
    switch (options.type) {
      case "join": {
        break;
      }
      default: {
      }
    }
  },
  getLocation: function() {
    return new Promise((resolve, reject) => {
      wx.getLocation({
        type: "gcj02",
        success: function(res) {
          // console.log(res);
          resolve(res);
        },
        fail: function(e) {
          reject(e);
        }
      });
    });
  }
});
