import moment from "moment";
import { get, put } from "../../../utils/request";
import {
  parseQuery,
  validateMobile,
  validateName,
  getContHeight
} from "../../../utils/util";
import { source } from "../../../setting";
import regeneratorRuntime from "../../../utils/regenerator-runtime/runtime";

const app = getApp();
// 有奖品的奖项
let test_data = [
  {
    name: "一等奖",
    left: 100,
    rate: 0.03
  },
  {
    name: "二等奖",
    left: 200,
    rate: 0.06
  },
  {
    name: "三等奖",
    left: 300,
    rate: 0.1
  },
  {
    name: "四等奖",
    left: 400,
    rate: 0.15
  }
];
Page({
  data: {
    nvabarData: {
      showCapsule: 1, // 是否显示左上角图标   1表示显示    0表示不显示
      title: "抽奖",
      textColor: "#fff", // 标题颜色
      bgColor: "#00bcbd", // 导航栏背景颜色
      btnBgColor: "#459d9f", // 胶囊按钮背景颜色
      iconColor: "white", // icon颜色 black/white
      borderColor: "rgba(255, 255, 255, 0.3)" // 边框颜色 格式为 rgba()，透明度为0.3
    },
    current: null,
    source,
    times: 4
  },
  onShow() {
    this.getContHeight();
    const user = wx.getStorageSync("user");
    this.setData({
      user: user || false
    });
    this.animation = wx.createAnimation({
      duration: 200,
      timingFunction: "ease"
    });
    if (app.globalData.isIPX) {
      this.setData({
        isIPX: app.globalData.isIPX
      });
    }
    this.fetch();
  },
  getContHeight: function() {
    this.setData({
      contHeight: getContHeight()
    });
  },
  getGifts: async function(activityId, customId) {
    return await get("v1/api/sys/giftProduct", { activityId, customId });
  },
  fetch: async function() {
    if (this.options.scene) {
      // 扫码进的
      const query = decodeURIComponent(this.options.scene);
      const { a } = parseQuery(query);
      // 获取活动详情
      const [data] = await get("v1/api/sys/activity", { autoId: a });
      if (data.customerSign && data.customerSign.length > 0) {
        data.signed = true;
      }
      if (this.data.user) {
        data.gifts = await this.getGifts(data.id, this.data.user.id);
      }
      data.acticityProducts.map((p) => {
        p.images = `${source}${p.images}`
      })
      this.setData(data);
      return data;
    } else if (this.options.id) {
      // 跳转进
      const [data] = await get("v1/api/sys/activity", { id: this.options.id });
      if (data.customerSign && data.customerSign.length > 0) {
        data.signed = true;
      }
      if (this.data.user) {
        data.gifts = await this.getGifts(data.id, this.data.user.id);
      }
      console.log(data)
      data.activityProducts.map((p) => {
        p.images = `${source}${p.images}`
      })
      this.setData(data);
      return data;
    }
  },
  onStart: function() {
    console.log("start");
  },
  onEnd: function(e) {
    console.log("end", e.detail);
  },
  onResult: function(e) {
    console.log("onResult", e.detail);
    setTimeout(() => {
      e.detail.stop(e.detail.target || 0);
      this.setData({
        times: this.data.times - 1
      })
    }, 2000);
  }
});
