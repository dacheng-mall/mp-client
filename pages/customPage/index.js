import { get } from "../../utils/request";
import { uri, getRoute } from "../../utils/util";
import regeneratorRuntime from "../../utils/regenerator-runtime/runtime";

const app = getApp();

Page({
  data: {
    elements: [],
    code: "",
    count: 0,
  },
  onShow() {
    wx.showShareMenu();
    const res = getRoute();
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
        ...options,
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
