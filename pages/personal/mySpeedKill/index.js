import moment from "moment";
import { get, put } from "../../../utils/request";
import { source } from "../../../setting";
import regeneratorRuntime from "../../../utils/regenerator-runtime/runtime";

const PAGE_DEF = { page: 1, pageSize: 10 };

Page({
  data: {
    source,
    pagination: { ...PAGE_DEF },
    data: [],
    qrType: []
  },
  onShow() {
    this.fetch(this.options);
  },
  getCustomerSigned: async function(activityId, customerId) {
    const [data] = await get("v1/api/sys/activityCustomers", {
      activityId,
      customerId
    });
    return data;
  },
  fetch: async function(options, isMore) {
    const user = wx.getStorageSync("user");
    const { page, pageSize } = this.data.pagination;
    const params = {
      customId: user.id,
      type: "seckill",
    }
    const res = await get(`v1/api/sys/giftProduct/${page}/${pageSize}`, {...params, ...options});
    res.data = res.data.map(d => {
      d.createTime = moment(d.createTime).format("YYYY-MM-DD HH:mm:ss");
      return d;
    });
    if (isMore) {
      res.data = [...this.data.data, ...res.data];
    }
    this.setData({
      ...options,
      ...res
    });
    wx.stopPullDownRefresh();
  },
  normalize: function(data) {
    if (data.length < 1) {
      return [];
    }
    return data.map(d => ({
      activityId: d.activity.id,
      activityName: d.activity.name,
      activityInstitutionId: d.activity.institutionId,
      salesmanId: d.salesman.id,
      salesmanName: d.salesman.name,
      salesmanInstitutionId: d.salesman.institutionId,
      createTime: d.createTime
        ? moment(d.createTime).format("YYYY-MM-DD HH:mm:ss")
        : "--"
    }));
  },
  onPullDownRefresh: function() {
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
  onReachBottom() {
    this.loadmore();
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
  call: function(e) {
    const { mobile, name } = e.currentTarget.dataset;
    wx.showModal({
      title: "联系客户经理",
      content: `${name}, ${mobile}`,
      confirmText: "拨打电话",
      success: function(res) {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: mobile
          });
        }
      }
    });
  },
  goDetail: function(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/activity/speed-kill/index?id=${id}`
    });
  },
  receive: function(e) {
    wx.showModal({
      title: '确认签收',
      content: '如果没有收到礼物, 请联系您的客户经理!',
      confirmText: '签收',
      success: async (res) => {
        if(res.confirm) {
          const { id, index } = e.currentTarget.dataset;
          const r = await put(`v1/api/sys/giftProduct`, [{
            id,
            status: "received"
          }]);
          if (r) {
            const data = [...this.data.data];
            data[index].status = "received";
            this.setData({
              data
            });
          }
        }
      }
    })
  }
});
