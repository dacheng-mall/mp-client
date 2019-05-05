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
  onLoad: function(){
    this.fetch();
  },
  onShow: function(){},
  fetch: async function() {
    const data = await get("v1/api/sys/activity");
    if (data) {
      this.setData({
        data,
      });
    }
  },
  onPullDownRefresh(){
    // wx.startPullDownRefresh({
    //   complates: function(){
    //     console.log('刷新')
    //   }
    // })
  },
  tap:function(e){
    wx.navigateTo({
      url: `/pages/activity/detail?id=${e.detail}`
    })
  }
})