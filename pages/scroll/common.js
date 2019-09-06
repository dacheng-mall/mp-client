import regeneratorRuntime from "../../utils/regenerator-runtime/runtime";
import { get } from "../../utils/request";
import { parseQuery } from "../../utils/util";
import { types } from "./types";

export const common = {
  data: {},
  onShow: function() {
    let _type = null;
    if (this.options.pageType) {
      const { pageType, ...query } = this.options;
      _type = types(pageType);
      if (!_type) {
        return;
      }
      _type.query = Object.assign({}, _type.query || {}, query);
    } else {
      _type = types("activity");
    }
    wx.setNavigationBarTitle({
      title: _type.title
    });
    this.setData({
      ..._type
    });
    this.init();
  },
  init: async function() {
    this.fetch(this.data.pagination, this.data.query);
    if (this.data.name === "qr") {
      this.setData({
        for: this.data.query.hasCustom ? "salesman" : "customer"
      });
    } else if(this.data.name === "myGift"){
      console.log(this.data)
      this.setData({
        for: this.data.query.salesmanId ? "salesman" : "customer"
      });
    }
  },
  fetch: async function(pagination, query, isMore) {
    const { api } = this.data;
    if (typeof query === "string") {
      query = parseQuery(query);
    }
    const { page, pageSize } = pagination;
    const data = await get(`${api}/${page}/${pageSize}`, query);
    if (isMore) {
      this.setData({
        list: [...this.data.list, ...data.data],
        pagination: data.pagination
      });
    } else {
      this.setData({
        list: data.data,
        pagination: data.pagination
      });
    }
    wx.stopPullDownRefresh();
  },
  onPullDownRefresh: function() {
    this.onShow();
  },
  onReachBottom() {
    const {
      pagination: { pageCount, page },
      query
    } = this.data;
    console.log(pageCount, page, query);
    if (pageCount > page) {
      this.setData({
        pagination: { ...this.data.pagination, page: page + 1 }
      });
      this.fetch(this.data.pagination, query, true);
    }
  }
};
