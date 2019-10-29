import moment from "moment";
import { post } from "../../../utils/request";
import { source } from "../../../setting";
import regeneratorRuntime from "../../../utils/regenerator-runtime/runtime";
const TYPES = [
  { name: "初次拜访", code: "first" },
  { name: "日常拜访", code: "daily" },
  { name: "签单", code: "deal" },
  { name: "送单", code: "send" },
  { name: "请客送礼", code: "feed" }
];
Component({
  properties: {
    data: {
      type: Object,
      observer: function(newVal) {
        if (newVal) {
          let current = {};
          const item = newVal;
          if (item.type) {
            this.data.types.findIndex;
            const index = this.data.types.findIndex(t => t.code === item.type);
            if (index || index === 0) {
              current = this.data.types[index];
            }
          }
          this.setData({
            item,
            current,
            stars: this.renderStars(item.stars),
            createTime: item.createTime
              ? moment(item.createTime).format("YYYY-MM-DD HH:mm:ss")
              : "--"
          });
        }
      }
    },
    for: {
      type: String
    },
    index: {
      type: Number
    }
  },
  data: {
    source,
    item: {},
    current: {},
    types: [...TYPES]
  },
  methods: {
    renderStars: (stars = 0) => {
      return new Array(5).fill(false).map((v, i) => {
        if (i < stars) {
          return true;
        }
        return false;
      });
    },
    call: function() {
      const { item } = this.data;
      const { mobile, customerName } = item;
      if (mobile) {
        wx.showModal({
          title: "联系客户",
          content: `${customerName || "未知姓名"}, ${mobile}`,
          confirmText: "拨打电话",
          success: function(res) {
            if (res.confirm) {
              wx.makePhoneCall({
                phoneNumber: mobile
              });
            }
          }
        });
      }
    },
    typeChange: async function(e) {
      const index = e.detail.value;
      const { id } = this.data.item;
      await post("v1/api/sys/elasticsearch/updateDocument", {
        index: "visited",
        id,
        body: {
          doc: {
            type: this.data.types[index].code
          }
        }
      });
      this.setData({
        current: this.data.types[index]
      });
    }
  }
});
