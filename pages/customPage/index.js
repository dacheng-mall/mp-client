import { get } from "../../utils/request";
import { getFavorites } from "../../utils/tools";
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
    if (data) {
      this.setData({
        ...data,
        count: favo.length
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
  dbClick: function(e) {
    const { type, id } = e.detail;
    if (type === "product") {
      // todo 执行收藏状态切换的逻辑
    }
  },
  submitHandle: e => {
    console.log("home onSubmit: ", e.detail.value);
  },
  favoEntry(e) {
    wx.navigateTo({
      url: `/pages/products/group/index?favorites=yes`
    });
  }
});
