import moment from "moment";
import { get, post } from "../../../utils/request";
import { parseQuery, getContHeight } from "../../../utils/util";
import { source } from "../../../setting";
import regeneratorRuntime from "../../../utils/regenerator-runtime/runtime";

const app = getApp();
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
    times: 2
  },
  onShow: async function() {
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
    const data = await this.fetch();
    this.salesmanSign(data);
    this.setPoster(data);
  },
  getContHeight: function() {
    this.setData({
      contHeight: getContHeight()
    });
  },
  reload: function() {
    this.fetch();
  },
  getGifts: async function(activityId, customId) {
    return await get("v1/api/sys/giftProduct", { activityId, customId });
  },
  setPoster: async function(data) {
    if (!data.enable) {
      return;
    }
    // 初始化海报信息
    const poster = {
      p_page: "pages/activity/lottery/index",
      p_title: data.name,
      p_scene: `?a=${data.autoId}`
    };
    // 获取海报背景
    poster.p_bg = `${source}${data.images[data.images.length - 1].url}`;
    // 获取场景值
    const user = wx.getStorageSync("user");
    if (user) {
      poster.p_scene += `&sa=${user.autoId}`;
    }
    this.setData({
      ...poster
    });
  },
  onShareAppMessage: function() {
    const { name, autoId: sa, userType } =
      this.data.user || wx.getStorageSync("user");
    const { enable, autoId: a, images } = this.data;
    const params = {
      title: `${name}邀您抽大奖`,
      imageUrl: `${source}${images[0].url}`
    };
    let query = `?scene=`
    if (userType === 4 && enable) {
      query += encodeURIComponent(`?a=${a}&sa=${sa}`)
    } else {
      query += encodeURIComponent(`?a=${a}`)
    }
    params.path = `/pages/activity/lottery/index${query}`;
    return params;
  },
  fetch: async function() {
    if (this.options.scene) {
      // 扫码进的
      const query = decodeURIComponent(this.options.scene);
      const { a, sa } = parseQuery(query);
      // 获取活动详情
      const [data] = await get("v1/api/sys/activity", { autoId: a });
      if (data.customerSign && data.customerSign.length > 0) {
        data.signed = true;
      }
      if (this.data.user) {
        data.gifts = await this.getGifts(data.id, this.data.user.id);
        data.times = data.totalCount - data.gifts.length;
      }
      data.activityProducts.map(p => {
        p.images = `${source}${p.images}`;
      });
      data.sid = sa;
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
        data.times = data.totalCount - data.gifts.length;
      }
      data.activityProducts.map(p => {
        p.images = `${source}${p.images}`;
      });
      this.setData(data);
      return data;
    }
  },
  // 业务员报名
  salesmanSign: async function(data) {
    const { sign = [], id } = data;
    const user = wx.getStorageSync("user");
    if (user && user.userType === 4 && user.id && (sign && sign.length < 1)) {
      // 用户是业务员, 而且有权限参与但是没报名
      const res = await this.sign(id, user.id);
      return res;
    }
    return user;
  },
  sign: async function(activityId, salesmanId) {
    const data = await post("v1/api/sys/activity/salesmanSignActivity", {
      salesmanId,
      activityId,
      status: 1
    });
    if (data) {
      this.setData({
        sign: [data]
      });
    }
  },
  afterSign: function(e) {
    if (e.detail.id) {
      this.setData({
        signed: true,
        customerSign: [...this.data.customerSign, e.detail]
      });
    }
  },
  afterLottery: async function(activityId, customId) {
    const gifts = await this.getGifts(activityId, customId);
    this.setData({
      gifts,
      times: this.data.totalCount - gifts.length
    });
  },
  // 抽奖的逻辑
  onStart: function() {},
  onEnd: function(e) {
    const {
      user: { id: customerId },
      id: activityId
    } = this.data;
    this.afterLottery(activityId, customerId);
  },
  onResult: async function(e) {
    // 这里调用生成领取记录的接口
    const { id } = this.data;
    const { nullIndex, target, stop, index } = e.detail;
    if (target.isNull) {
      await post("v1/api/sys/giftProduct/seckill", {
        activityId: id
      });
      stop(parseInt(nullIndex, 10));
    } else {
      try {
        await post("v1/api/sys/giftProduct/seckill", {
          id: target.id
        });
        stop(parseInt(index, 10));
      } catch (e) {
        // 这里要生成空奖领取记录
        switch (e.code) {
          case "disabled":
          case "sold-out":
          case "activity-total-over": {
            await post("v1/api/sys/giftProduct/seckill", {
              activityId: id,
              productId: target.id,
              productName: Array.isArray(target.showName)
                ? target.showName.join(":")
                : target.showName
            });
            stop(parseInt(nullIndex, 10));
            break;
          }
        }
      }
    }
  },
  showMyPrize: function(e) {
    const { id } = this.data;
    wx.navigateTo({
      url: `/pages/scroll/index?pageType=mySpeedKill&activityId=${id}`
    });
  },
  myCustomers: function(e) {
    const { id } = this.data;
    wx.navigateTo({
      url: `/pages/scroll/index?pageType=myCustomers&activityId=${id}`
    });
  }
});
