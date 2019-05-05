import moment from "moment";
import { source } from "../../../../../setting";
import { put } from "../../../../../utils/request";
import regeneratorRuntime from "../../../../../utils/regenerator-runtime/runtime";
Component({
  relations: {
    "./index": {
      type: "parent"
    }
  },
  properties: {
    data: {
      type: Object,
      value: {},
      observer: function(val) {
        val.createTime = moment(val.createTime).format("YYYY-MM-DD HH:mm:ss");
        this.setData({
          _data: val
        });
      }
    }
  },
  data: {
    source
  },
  methods: {
    check: function(e) {
      const { id, aid: activityId } = e.currentTarget.dataset;
      const that = this;
      wx.showModal({
        title: "立即签收",
        content: "您确定已经收到所有礼物了吗?",
        success: async function(res) {
          if (res.confirm) {
            const data = await put("v1/api/sys/giftNew", {
              id,
              activityId,
              status: 2
            });
            if (data.id) {
              that.setData({
                _data: { ...that.data._data, status: data.status }
              });
            }
          }
        }
      });
    }
  }
});
