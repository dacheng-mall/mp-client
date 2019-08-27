import { source } from "../../../setting";
import { get, put } from "../../../utils/request";
import moment from "moment";
import regeneratorRuntime from "../../../utils/regenerator-runtime/runtime";

const DEF_PAGINATION = { page: 1, pageSize: 10, pageCount: 0 };

Page({
  data: {
    source,
    list: [],
    pagination: { ...DEF_PAGINATION },
    loading: false
  },
  onLoad: async function() {
    const user = wx.getStorageSync("user");
    this.fetch({ salesmanId: user.id });
  },
  fetch: async function({ salesmanId, pageInfo = {} }) {
    const {
      pagination: { page, pageSize }
    } = this.data;
    const { data, pagination } = await get(
      `v1/api/sys/activitySalesmen/${pageInfo.page || page}/${pageInfo.pageSize || pageSize}`,
      {
        salesmanId
      }
    );
    if (
      data.length > 0 &&
      pagination.pageCount > this.data.pagination.pageCount
    ) {
      const _list = this.normalizeData(data);
      this.setData({
        list: [...this.data.list, ..._list],
        salesmanId,
        pagination
      });
    }
  },
  normalizeData(data) {
    return data.map(item => {
      let statusName = "";
      switch (item.activity.status) {
        case 0: {
          statusName = "准备中";
          break;
        }
        case 1: {
          statusName = "进行中";
          break;
        }
        case 2: {
          statusName = "已结束";
          break;
        }
        default: {
          statusName = "--";
          break;
        }
      }
      return {
        id: item.id,
        name: item.activity.name,
        type: item.activity.activityType,
        dateStart: moment(item.activity.dateStart).format("YYYY-MM-DD"),
        dateEnd: moment(item.activity.dateEnd).format("YYYY-MM-DD"),
        image: item.activity.images[0] ? item.activity.images[0].url : null,
        status: item.activity.status,
        statusName,
        activityId: item.activity.id,
        institutionId: item.activity.institution.id,
        institutionName: item.activity.institution.name
      };
    });
  },
  onReachBottom() {
    const { pagination } = this.data;
    if (pagination.page <= pagination.pageCount || !pagination.pageCount) {
      this.fetch({
        salesmanId: this.data.salesmanId,
        pageInfo: {
          page: this.data.pagination.page + 1,
          pageSize: this.data.pagination.pageSize
        }
      });
    }
  },
  tap: function(e) {
    const { aid, atype } = e.currentTarget.dataset;
    const salesmanId = this.data.salesmanId;
    wx.navigateTo({
      url: `/pages/personal/myActivity/myCustomer?sid=${salesmanId}&aid=${aid}&type=${atype}`
    });
  }
});
