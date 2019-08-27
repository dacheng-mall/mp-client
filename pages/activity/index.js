import { get } from "../../utils/request";
import { source } from "../../setting";
import regeneratorRuntime from "../../utils/regenerator-runtime/runtime";

Page({
  data: {
    data: [],
    code: "",
    count: 0,
    source
  },
  onShow: function() {
    this.fetch();
  },
  fetch: async function() {
    const data = await get("v1/api/sys/activity", { status: 1 });
    if (data) {
      this.setData({
        data
      });
    }
  },
  onPullDownRefresh() {
    // wx.startPullDownRefresh({
    //   complates: function(){
    //     console.log('刷新')
    //   }
    // })
  },
  tap: function(e) {
    const { id, type } = e.detail;
    switch (type) {
      case "at_second_kill": {
        wx.navigateTo({
          url: `/pages/activity/speed-kill/index?id=${id}`
        });
        break;
      }
      default: {
        wx.navigateTo({
          url: `/pages/activity/detail?id=${id}`
        });
      }
    }
  }
});
