import moment from "moment";
import { source } from "../../../setting";
import { get, put } from "../../../utils/request";
import regeneratorRuntime from "../../../utils/regenerator-runtime/runtime";

Page({
  data: {
    source,
    list: [],
    pagination: { page: 1, pageSize: 16, pageCount: 0 },
    loading: false
  },
  onLoad: function() {
    this.fetch(this.options);
    const { windowHeight } = wx.getSystemInfoSync();
    this.setData({
      windowHeight,
      ...this.options
    });
  },
  fetch: async function({
    sid,
    aid,
    type,
    pageInfo = { page: 1, pageSize: 16 }
  }) {
    this.setData({
      loading: true
    });
    const params = {};
    const user = wx.getStorageSync("user");
    if (sid) {
      params.salesmanId = sid;
    } else if (user && user.userType === 4) {
      params.salesmanId = user.id;
    } else {
      wx.navigateBack({
        delta: 1
      });
      return;
    }
    if (aid) {
      params.activityId = aid;
    }
    if (type !== undefined) {
      params.type = type === "at_second_kill" ? "seckill" : ""
    }
    const { data, pagination } = await get(
      `v1/api/sys/giftProduct/${pageInfo.page}/${pageInfo.pageSize}`,
      params
    );
    if (
      data.length > 0 &&
      pagination.pageCount > this.data.pagination.pageCount
    ) {
      // const { list, activity } = this.normalizeData(data);
      if (pagination.page > pagination.pageCount) {
        pagination.page = pagination.pageCount;
      }
      data.map(d => {
        d.createTime = moment(d.createTime).format("YYYY-MM-DD HH:mm:ss");
      });
      this.setData({
        list: [...this.data.list, ...data],
        pagination,
        loading: false
      });
    } else {
      this.setData({
        loading: false
      });
    }
  },
  normalizeData(data) {
    const {
      activity: { institution, name }
    } = data[0];

    const list = data.map(item => ({
      name: item.customerName,
      id: item.customerId,
      mobile: item.customerMobile,
      avatar: item.productImage,
      gifts: item.giftProducts,
      status: item.status
    }));
    // const activity = {
    //   institutionName: institution.name,
    //   name
    // };
    return {
      list
      // activity
    };
  },
  onReachBottom() {
    const { pagination } = this.data;
    if (pagination.page <= pagination.pageCount || !pagination.pageCount) {
      this.fetch({
        ...this.options,
        pageInfo: {
          page: this.data.pagination.page + 1,
          pageSize: this.data.pagination.pageSize
        }
      });
    }
  },
  makePhoneCall: function(e) {
    const { mobile } = e.currentTarget.dataset;
    if (mobile) {
      wx.makePhoneCall({
        phoneNumber: mobile
      });
    }
  }
});
