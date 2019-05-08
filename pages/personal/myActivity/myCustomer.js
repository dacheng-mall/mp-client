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
      windowHeight
    });
  },
  fetch: async function({ sid, aid, pageInfo = { page: 1, pageSize: 16 } }) {
    this.setData({
      loading: true
    });
    const { data, pagination } = await get(
      `v1/api/sys/giftNew/${pageInfo.page}/${pageInfo.pageSize}`,
      {
        activityId: aid,
        salesmanId: sid
      }
    );
    if (
      data.length > 0 &&
      pagination.pageCount > this.data.pagination.pageCount
    ) {
      const { list, activity } = this.normalizeData(data);
      if (pagination.page > pagination.pageCount) {
        pagination.page = pagination.pageCount;
      }
      this.setData({
        activity,
        list: [...this.data.list, ...list],
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
      name: item.custom.name,
      id: item.custom.id,
      mobile: item.custom.mobile,
      avatar: item.custom.avatar,
      gifts: item.giftProducts,
      status: item.status
    }));
    const activity = {
      institutionName: institution.name,
      name
    };
    return {
      list,
      activity
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
  },
});
