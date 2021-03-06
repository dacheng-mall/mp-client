import moment from "moment";
import { source } from "../../../setting";

Component({
  properties: {
    data: {
      type: Object,
      value: {},
      observer: function(newVal) {
        // 只要prop.data发生变更就做一次集中处理
        newVal.dateStart = moment(newVal.dateStart).format(
          "YYYY-MM-DD HH:mm:ss"
        );
        newVal.dateEnd = moment(newVal.dateEnd).format("YYYY-MM-DD HH:mm:ss");
        newVal.createTime = moment(newVal.createTime).format(
          "YYYY-MM-DD HH:mm:ss"
        );
        this.setData({
          item: newVal
        });
      }
    },
    title: {
      type: String,
      value: ""
    }
  },
  data: {
    source
  },
  lifetimes: {
    attached: function() {
      const { screenWidth } = wx.getSystemInfoSync();
      this.setData({
        width: Math.floor(screenWidth - 20),
        height: screenWidth - 20
      });
    }
  },
  methods: {
    tap() {
      const { id, activityType } = this.data.item;
      this.triggerEvent("itemTouch", { id, type: activityType });
    }
  }
});
