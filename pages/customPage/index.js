import { get } from "../../utils/request";
Page({
  data: {
    elements: [],
    code: ""
  },
  onLoad(options) {
    get("v1/api/sys/page", options).then(([data]) => {
      this.setData({
        ...data
      });
    });
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
  }
});
