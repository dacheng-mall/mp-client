import { source } from "../../../setting";
import moment from "moment";

Component({
  properties: {
    data: {
      type: Object,
      observer: function(newVal) {
        if (newVal) {
          console.log(newVal);
          this.setData({
            item: this.normalizeData(newVal)
          });
        }
      }
    },
    for: {
      type: String
    },
    types: {
      type: Array,
      observer: function(newVal) {
        if (newVal) {
          this.setData({
            types: newVal
          });
        }
      }
    }
  },
  data: {
    source
  },
  methods: {
    normalizeData: function(d) {
      const { types } = this.data;
      const type = types.find(({ id }) => id === d.typeId);
      const res = { id: d.id, autoId: d.autoId };
      if (type) {
        res.typeName = type.name;
      } else {
        res.typeName = "未知类型";
      }
      res.hasSent = true;
      res.salesmanBindTime = d.salesmanBindTime
        ? moment(d.salesmanBindTime).format("YYYY-MM-DD HH:mm:ss")
        : null;
      res.userBindTime = d.userBindTime
        ? moment(d.userBindTime).format("YYYY-MM-DD HH:mm:ss")
        : null;
      res.customerName = d.custom.name;
      res.salesmanName = d.salesman.name;
      console.log("res", res);
      return res;
    },
    goDetail: function(e) {
      const id = e.currentTarget.dataset.id;
      wx.navigateTo({
        url: `/pages/qrcode/index?id=${id}`
      })
    }
  }
});
