import { get } from "../../utils/request";
import { getFavorites } from "../../utils/tools";
import { uri } from "../../utils/util";
import regeneratorRuntime from "../../utils/regenerator-runtime/runtime";

Page({
  data: {
    elements: [],
    code: "",
    count: 0,
  },
  onLoad: async function(options) {
    const favo = await getFavorites();
    const [data] = await get("v1/api/sys/page", options);
    const path = uri(this.route, options)
    if (data) {
      this.setData({
        ...data,
        count: favo.length,
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
  favoEntry(e) {
    wx.navigateTo({
      url: `/pages/products/group/index?favorites=yes`
    });
  }
});
