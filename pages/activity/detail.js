// import _ from 'lodash';
import { get, post, put } from "../../utils/request";
import moment from "moment";
import { uri, getRoute } from "../../utils/util";
import { source } from "../../setting";
import regeneratorRuntime from "../../utils/regenerator-runtime/runtime";
const validateMobile = /^1(3|4|5|7|8)\d{9}$/;

Page({
  data: {
    source,
    iWantThem: [], //用户想要领取的礼物,
    step: 0
  },
  onLoad: function(options) {
    // if (options.sid) {
    //   // 如果有业务员信息则请求, 这是分享连接进来的普通用户
    //   this.fetchSaleman(options.sid);
    // }
  },
  onShow: function() {
    this.fetch(this.options);
    // 初始化动画
    const user = wx.getStorageSync("user");
    this.setData({
      user
    });
    this.animation = wx.createAnimation({
      duration: 200,
      timingFunction: "ease"
    });
  },
  showGetPanel: function() {
    this.animation
      .top(0)
      .height("100vh")
      .opacity(1)
      .step();
    this.setData({
      animationData: this.animation.export()
    });
  },
  hideGetPanel: function() {
    this.animation
      .top("100vh")
      .height(0)
      .opacity(0)
      .step();
    this.setData({
      animationData: this.animation.export(),
      step: this.options.sid ? 1 : 0
    });
  },
  checkSalesman: async function(e) {
    const { salesmanMobile: mobile } = e.detail.value;
    const { id: activityId } = this.data;
    if (!validateMobile.test(mobile)) {
      wx.showToast({
        title: "无效手机号",
        icon: "none"
      });
      return;
    }
    const { id } = await post("v1/api/sys/activity/salesmanActivityEnable", {
      activityId,
      mobile
    });
    console.log(id);
    if (id) {
      wx.showToast({
        title: "查询成功"
      });
      this.setData({
        salesmanId: id,
        step: 1
      });
    } else {
      wx.showToast({
        title: "无效客户经理, 请重新输入手机号",
        icon: "none"
      });
    }
  },
  goStep: function(e) {
    const { next } = e.currentTarget.dataset;
    if (next === 1 && this.data.iWantThem.length < 1) {
      wx.showToast({
        title: "请选择礼品",
        icon: "none"
      });
      return;
    }
    this.setData({
      step: next
    });
  },
  chooseGift: function(e) {
    const { id, index } = e.currentTarget.dataset;
    const { iWantThem, products, totalCount } = this.data;
    if (!iWantThem.includes(id) && iWantThem.length >= totalCount) {
      wx.showToast({
        title: `最多选择${totalCount}个礼品`,
        icon: "none"
      });
      return;
    }
    const newIWantThem = iWantThem.includes(id)
      ? iWantThem.filter(_id => _id !== id)
      : [...iWantThem, id];
    products[index].checked = !products[index].checked;
    this.setData({
      iWantThem: newIWantThem,
      products: [...products]
    });
  },
  onReady: function() {
    const user = wx.getStorageSync("user");
    if (user.userType === 2) {
      this.animation = wx.createAnimation();
    }
  },
  fetch: async function({ id, sid }) {
    const [data] = await get("v1/api/sys/activity", { id });
    if (data) {
      const { screenWidth, windowHeight } = wx.getSystemInfoSync();
      data.dateStart = moment(data.dateStart).format("YYYY-MM-DD");
      data.dateEnd = moment(data.dateEnd).format("YYYY-MM-DD");
      data.createTime = moment(data.createTime).format("YYYY-MM-DD");
      this.setData({
        ...data,
        width: screenWidth,
        height: windowHeight
      });
      this.fetchGrades(data.institutionId, data.grades);
    }
    if (sid) {
      this.fetchSaleman(sid);
    } else {
      this.setData({
        step: 0
      });
    }
  },
  fetchSaleman: async function(id) {
    const data = await get(`v1/api/sys/user/${id}`);
    if (data) {
      this.setData({
        salesman: data,
        step: 1
      });
    }
  },
  fetchGrades: async function(insId, grades) {
    const data = await get(`v1/api/sys/grade/findGradesByInsId`, { insId });
    const gradesItem = grades
      .split(",")
      .map(gid => {
        return data.find(({ id }) => gid === id).name;
      })
      .join(", ");

    this.setData({
      gradesItem
    });
  },
  sign: async function() {
    const { id: salesmanId } = this.data.user;
    const activityId = this.data.id;
    const data = await post("v1/api/sys/activity/salesmanSignActivity", {
      salesmanId,
      activityId,
      status: 1
    });
    if (data) {
      wx.showToast({
        title: "报名成功"
      });
      this.setData({
        sign: [data]
      });
    }
  },
  formSubmit: async function(e) {
    const { value } = e.detail;
    const { mobile, name, address, idCard, id: customId } =
      this.data.user || wx.getStorageSync("user");
    const body = { mobile, name, address, idCard, ...value, id: customId };
    if (!body.name) {
      wx.showToast({
        title: "请输入姓名",
        icon: "none"
      });
      return;
    }
    if (!body.mobile) {
      wx.showToast({
        title: "请输入手机号",
        icon: "none"
      });
      return;
    } else if (!validateMobile.test(body.mobile)) {
      wx.showToast({
        title: "无效手机号",
        icon: "none"
      });
      return;
    }
    // 先提交用户信息
    const data = await put("v1/api/sys/user", body);
    if (data) {
      this.setData({
        user: data
      });
      wx.setStorageSync("user", data);
      const baseInfo = {
        customId,
        activityId: this.data.id,
        salesmanId:
          (this.data.salesman && this.data.salesman.id) || this.data.salesmanId,
        status: 1
      };
      if (!baseInfo.salesmanId) {
        wx.showToast({
          title: "未绑定有效客户经理, 请重新绑定",
          icon: "none"
        });
        this.setData({
          step: 0
        });
        return;
      }
      const param = [];
      this.data.products.map(prod => {
        if (prod.checked) {
          param.push({
            ...baseInfo,
            productId: prod.id,
            count: prod.totalCount
          });
        }
      });

      const gifts = await post("v1/api/sys/gift", param);
      this.setData({
        gifts,
        customCount: this.data.customCount + 1
      });
      this.hideGetPanel();
    }
  },
  getGift: function() {
    this.animation
      .opacity(0)
      .step({
        duration: 200
      })
      .opacity(1)
      .step({
        duration: 200
      });
    this.setData({
      animation: this.animation.export()
    });
  },
  gotoMyGifts: function() {
    wx.switchTab({
      url: "/pages/personal/index"
    });
  },
  cancel: function() {},
  onShareAppMessage: function() {
    // 业务员分享功能
    const { name, id: sid } = this.data.user || wx.getStorageSync("user");
    return {
      title: `${name}送您的礼物`,
      path: `/pages/activity/detail?id=${this.data.id}&sid=${sid}`,
      imageUrl: `${source}${this.data.images[0].url}`
    };
  },
  makePhoneCall: function(e) {
    const { mobile } = e.currentTarget.dataset;
    if (mobile) {
      wx.makePhoneCall({
        phoneNumber: mobile
      });
    }
  }
});
