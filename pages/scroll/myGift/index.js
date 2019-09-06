import moment from "moment";
import { get, put } from "../../../utils/request";
import { source } from "../../../setting";
import regeneratorRuntime from "../../../utils/regenerator-runtime/runtime";

const PAGE_DEF = { page: 1, pageSize: 10 };

Component({
  properties: {
    data: {
      type: Object,
      observer: function(newVal) {
        if (newVal) {
          console.log(newVal);
          this.setData({
            item: this.normalize(newVal)
          });
        }
      }
    },
    for: {
      type: String
    }
  },
  data: {
    source,
    item: {}
  },
  methods: {
    getCustomerSigned: async function(activityId, customerId) {
      const {
        data: [data]
      } = await get("v1/api/sys/activityCustomers/1/1", {
        activityId,
        customerId
      });
      return data;
    },
    normalize: d => ({
      id: d.id,
      count: d.count,
      activityId: d.activityId,
      activityName: d.activityName,
      activityInstitutionId: d.institutionId,
      salesmanId: d.salesmanId,
      salesmanName: d.salesmanName,
      salesmanMobile: d.salesmanMobile,
      customerId: d.customerId,
      customerName: d.customerName,
      customerMobile: d.customerMobile,
      productImage: d.productImage,
      productName: d.productName,
      status: d.status,
      createTime: d.createTime
        ? moment(d.createTime).format("YYYY-MM-DD HH:mm:ss")
        : "--"
    }),
    call: function(e) {
      const { item, for: role } = this.data;
      switch (role) {
        case "salesman": {
          const { customerMobile, customerName } = item;
          if (customerMobile) {
            wx.showModal({
              title: "联系客户",
              content: `${customerName || '未知姓名'}, ${customerMobile}`,
              confirmText: "拨打电话",
              success: function(res) {
                if (res.confirm) {
                  wx.makePhoneCall({
                    phoneNumber: customerMobile
                  });
                }
              }
            });
          }
          break;
        }
        case "customer": {
          const { salesmanMobile, salesmanName } = item;
          if (salesmanMobile) {
            wx.showModal({
              title: "联系客户经理",
              content: `${salesmanName || '未知姓名'}, ${salesmanMobile}`,
              confirmText: "拨打电话",
              success: function(res) {
                if (res.confirm) {
                  wx.makePhoneCall({
                    phoneNumber: salesmanMobile
                  });
                }
              }
            });
          }
          break;
        }
      }
    },
    goDetail: function(e) {
      const { id } = e.currentTarget.dataset;
      wx.navigateTo({
        url: `/pages/activity/speed-kill/index?id=${id}`
      });
    },
    receive: function(e) {
      wx.showModal({
        title: "确认签收",
        content: "如果没有收到礼物, 请联系您的客户经理!",
        confirmText: "签收",
        success: async res => {
          if (res.confirm) {
            const { id } = e.currentTarget.dataset;
            const r = await put(`v1/api/sys/giftProduct`, [
              {
                id,
                status: "received"
              }
            ]);
            if (r) {
              this.setData({
                item: { ...this.data.item, status: "received" }
              });
            }
          }
        }
      });
    }
  }
});
