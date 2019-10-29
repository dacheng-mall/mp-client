import regeneratorRuntime from "../../utils/regenerator-runtime/runtime";
import { get, post } from "../../utils/request";
import { parseQuery } from "../../utils/util";
import { types } from "./types";

export const common = {
  data: {
    list: [],
    pagination: {}
  },
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
      ..._type,
      list: null
    });
    this.init();
  },
  init: async function() {
    this.fetch(this.data.pagination, this.data.query, this.data.body);
    if (this.data.name === "qr") {
      this.setData({
        for: this.data.query.hasCustom ? "salesman" : "customer"
      });
    } else if (this.data.name === "myGift") {
      this.setData({
        for: this.data.query.salesmanId ? "salesman" : "customer"
      });
    }
  },
  fetch: async function(pagination, query, body, isMore) {
    const { api } = this.data;
    if (typeof query === "string") {
      query = parseQuery(query);
    }
    const { page, pageSize } = pagination;
    let data = {};
    if (/^v1\/api\/sys\/elasticsearch/.test(api)) {
      query.from = this.data.list ? this.data.list.length : 0;
      query.size = pageSize;
      const { hits } = await post(`${api}`, { ...query, body });
      const {
        hits: list,
        total: { value: total }
      } = hits;
      data.data = list.map(item => ({ ...item._source, id: item._id }));
      data.pagination = {
        ...pagination,
        total,
        pageCount: Math.ceil(total / pageSize),
        page: this.data.list
          ? Math.floor(this.data.list.length / pageSize) + 1
          : 1
      };
    } else {
      data = await get(`${api}/${page}/${pageSize}`, query);
    }
    if (isMore) {
      console.log();
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
      query,
      body
    } = this.data;
    if (pageCount > page) {
      this.setData({
        pagination: { ...this.data.pagination, page: page + 1 }
      });
      this.fetch(this.data.pagination, query, body, true);
    }
  }
};
