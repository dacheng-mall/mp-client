import regeneratorRuntime from "../../../utils/regenerator-runtime/runtime";
import { get } from "../../../utils/request";
import { source } from "../../../setting";

const PAGE_DEF = { page: 1, pageSize: 8 };
const QUERY_DEF = { status: 1 };

Page({
  data: {
    value: { data: [], type: "list" },
    pagination: { ...PAGE_DEF },
    query: { ...QUERY_DEF }
  },
  onLoad: function() {
    this.fetch();
  },
  fetch: async function(more) {
    const { page, pageSize } = this.data.pagination;
    const {
      value: { data },
      query
    } = this.data;
    const { data: res, pagination } = await get(
      `v1/api/sys/product/${page}/${pageSize}`,
      { ...query, ...this.potions }
    );
    if (res.length > 0) {
      const list = res.map(
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
      if (more) {
        this.setData({
          "value.data": [...data, ...list],
          pagination
        });
      } else {
        this.setData({
          "value.data": list,
          pagination
        });
      }
      wx.stopPullDownRefresh();
    }
  },
  onShow() {
    wx.showShareMenu();
  },
  onPullDownRefresh: function() {
    this.fetch();
  },
  onReachBottom() {
    const {
      pagination: { pageCount, page }
    } = this.data;
    if (pageCount > page) {
      this.setData({
        pagination: { ...this.data.pagination, page: page + 1 }
      });
      this.fetch(true);
    }
  }
});
