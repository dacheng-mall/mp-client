import moment from "moment";
import { get, put } from "../../../utils/request";
import { source } from "../../../setting";
import regeneratorRuntime from "../../../utils/regenerator-runtime/runtime";

const PAGE_DEF = { page: 1, pageSize: 10 };

Page({
  data: {
    pagination: { ...PAGE_DEF },
    data: [],
    qrType: []
  },
  onShow() {
    this.fetch(this.options);
    // wx.startPullDownRefresh({

    // })
  },
  fetchType: async function() {
    if (this.data.qrType.length > 0) {
      return this.data.qrType;
    }
    const data = await get("v1/api/sys/qrType");
    if (data.length > 0) {
      this.setData({
        qrType: data.map(({ id, name }) => ({ id, name }))
      });
    }
    return data;
  },
  fetch: async function(options, isMore) {
    const types = await this.fetchType();
    const user = wx.getStorageSync("user");
    const { page, pageSize } = this.data.pagination;
    let res = {};
    switch (options.type) {
      case "salesman": {
        res = await get(`v1/api/sys/qr/${page}/${pageSize}`, {
          salesmanId: user.id
        });
        break;
      }
      case "user": {
        res = await get(`v1/api/sys/qr/${page}/${pageSize}`, {
          userId: user.id
        });
        break;
      }
      default:
        break;
    }
    // 添加码类型
    res.data = this.normalize(res.data, types, options.type);
    if (isMore) {
      res.data = [...this.data.data, ...res.data];
    }
    this.setData({
      ...options,
      ...res
    });
    wx.stopPullDownRefresh()
  },
  normalize: function(data, types = [], bindType) {
    if (data.length < 1) {
      return data;
    }
    return data.map(d => {
      const type = types.find(({ id }) => id === d.typeId);
      const res = { id: d.id, autoId: d.autoId };
      if (type) {
        res.typeName = type.name;
      } else {
        res.typeName = "未知类型";
      }
      res.hasSent = !!d.userId
      res.salesmanBindTime = d.salesmanBindTime
        ? moment(d.salesmanBindTime).format("YYYY-MM-DD HH:mm:ss")
        : null;
      res.userBindTime = d.userBindTime
        ? moment(d.userBindTime).format("YYYY-MM-DD HH:mm:ss")
        : null;
      return res;
    });
  },
  onPullDownRefresh: function(){
    this.refresh();
  },
  refresh: function() {
    this.setData({
      pagination: { ...PAGE_DEF },
      data: [],
      qrType: []
    });
    this.fetch(this.options);
  },
  onReachBottom(){
    this.loadmore()
  },
  loadmore: function() {
    const { pageCount, page } = this.data.pagination;
    if (pageCount > page) {
      this.setData({
        pagination: { ...this.data.pagination, page: page + 1 }
      });
      this.fetch(this.options, "more");
    }
  },
  goDetail: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/qrcode/index?id=${id}`
    })
  }
});
