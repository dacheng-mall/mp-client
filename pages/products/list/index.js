import regeneratorRuntime from "../../../utils/regenerator-runtime/runtime";
import { get } from "../../../utils/request";
import { source } from "../../../setting";

Page({
  data: {
    value: { data: [], type: "list" }
  },
  onLoad: async function(opt) {
    const data = await get("v1/api/sys/product", opt);
    if (data.length > 0) {
      const list = data.map(
        ({ id, mainImageUrl, institutionId, title, price }) => ({
          id,
          image: `${source}${mainImageUrl}`,
          isSelf: !institutionId,
          name: title,
          path: `/pages/products/detail/index?id=${id}`,
          price,
          size: 1,
          type: "product"
        })
      );
      this.setData({
        'value.data': list
      });
    }
  },
  onShow() {
    wx.showShareMenu();
  }
});
