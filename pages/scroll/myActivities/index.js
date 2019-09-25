import { source } from "../../../setting";
import moment from "moment";

Component({
  properties: {
    data: {
      type: Object,
      observer: function(newVal) {
        if (newVal) {
          this.setData({
            item: this.normalizeData(newVal)
          });
        }
      }
    }
  },
  data: {
    source
  },
  methods: {
    normalizeData(item) {
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
    },
    tap: function(e) {
      const { aid, atype } = e.currentTarget.dataset;
      wx.navigateTo({
        url: `/pages/scroll/index?pageType=myCustomers&activityId=${aid}&type=${atype === "at_second_kill" ? "seckill" : ""}`
      });
    }
  }
});
