import { source } from "../../../setting";
import { get, put } from "../../../utils/request";
import regeneratorRuntime from "../../../utils/regenerator-runtime/runtime";

Page({
  data: {
    source,
    list: []
  },
  onShow: async function() {
    if (this.options.id) {
      // 这个是请求详情的节奏
      const list = await get("v1/api/sys/giftNew", { id: this.options.id });
      if (list.length > 0) {
        this.setData({
          list
        });
      }
    } else {
      // 这个是请求个人列表的节奏
      // TODO 请求前100条, 暂时不分页
      const user = wx.getStorageSync("user");
      const { data, pagination } = await get("v1/api/sys/giftNew/1/10", {
        customId: user.id
      });
      if (data.length > 0) {
        this.setData({
          list: data,
          pagination
        });
      }
    }
  }
});
