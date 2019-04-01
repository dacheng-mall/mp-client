import { get } from "../../utils/request";
import { uri, getRoute } from "../../utils/util";
import { source } from "../../setting";
import regeneratorRuntime from "../../utils/regenerator-runtime/runtime";

Page({
  data: {
    elements: [],
    code: "",
    count: 0,
    source
  },
  onLoad() {
    wx.showShareMenu();
    wx.showTabBar();
    this.fetch({ code: "home" });
  },
  fetch: async function(options) {
    const [data] = await get("v1/api/sys/page", options);
    const path = uri(this.route, options);
    data.elements.forEach(elem => {
      if (elem.type === "article") {
        elem.data = JSON.parse(elem.data);
        elem.data.forEach(d => {
          if (d.type === "image") {
            d.value = `${source}${d.value}`;
          }
        });
      }
    });
    if (data) {
      this.setData({
        ...data,
        ...options,
        path
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
  }
});
