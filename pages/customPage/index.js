import { get } from "../../utils/request";
import { getFavorites } from "../../utils/tools";
import { uri, getRoute } from "../../utils/util";
import regeneratorRuntime from "../../utils/regenerator-runtime/runtime";

const app = getApp();

Page({
  data: {
    elements: [],
    code: "",
    count: 0,
  },
  onLoad: function(options) {
    if(options.code === 'home') {
      app.globalData.scene = null;
    }
  },
  onShow() {
    const res = getRoute()
    if(res.path !== this.data.path) {
      this.fetch(res.options)
    }
  },
  fetch: async function (options) {
    const [data] = await get("v1/api/sys/page", options);
    const path = uri(this.route, options)
    if (data) {
      this.setData({
        ...data,
        path,
      });
    }
  },

  click: function(e) {
    const { path } = e.detail;
    if (path) {
      wx.navigateTo({
        url: path
      });
    }
  },
});
