import { get, post } from "../../../utils/request";
import {
  parseQuery,
  validateMobile,
  validateName,
  getContHeight
} from "../../../utils/util";
import { source } from "../../../setting";
import regeneratorRuntime from "../../../utils/regenerator-runtime/runtime";

const app = getApp();
Page({
  data: {
    nvabarData: {
      showCapsule: 1, // 是否显示左上角图标   1表示显示    0表示不显示
      title: "活动详情",
      textColor: "#fff", // 标题颜色
      bgColor: "#00bcbd", // 导航栏背景颜色
      btnBgColor: "#459d9f", // 胶囊按钮背景颜色
      // iconColor: "white", // icon颜色 black/white
      borderColor: "rgba(255, 255, 255, 0.3)" // 边框颜色 格式为 rgba()，透明度为0.3
    },
    source,
    current: 0,
    salesman: null,
    isIPX: false,
    hasCustomerSigned: false,
    sign: []
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
    await this.init(this.options);
  },
  init: async function(options) {
    const data = await this.fetch(options);
    if (data.enable) {
      // 如果是业务员, 自动报名
      await this.salesmanSign(data);
      await this.setPoster(data);
    }
  },
  getCustomerSigned: async function(activityId, customerId) {
    const [data] = await get("v1/api/sys/activityCustomers", {
      activityId,
      customerId
    });
    return data;
  },
  getContHeight: function() {
    this.setData({
      contHeight: getContHeight()
    });
  },
  fetch: async function(options) {
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
      this.setData(data);
      return data;
    } else if (this.options.id) {
      // 跳转进
      const [data] = await get("v1/api/sys/activity", { id: options.id });
      if (data.customerSign && data.customerSign.length > 0) {
        data.signed = true;
      }
      if (this.data.user) {
        data.gifts = await this.getGifts(data.id, this.data.user.id);
      }
      this.setData(data);
      return data;
    }
  },
  change(e) {
    const index = e.target.dataset.index;
    if (index !== this.data.ccurrent) {
      this.setData({
        current: index
      });
    }
  },
  productChange(e) {
    this.setData({
      current: e.detail.current
    });
  },
  showGetPanel: async function() {
    this.animation
      .bottom(0)
      .height(this.data.contHeight)
      .opacity(1)
      .step();
    // 请求业务员信息, 有可能时没有权限的业务员
    const salesman = await this.getSalesman();
    if (salesman) {
      // 拿到业务员信息后,
      const isAuthSalesman = await this.checkSalesman(
        salesman.institutionId,
        this.data.institutionId
      );
      // 如果已经存在业务员
      if (isAuthSalesman) {
        this.setData({
          animationData: this.animation.export(),
          step: 1,
          salesman
        });
      } else {
        this.setData({
          animationData: this.animation.export(),
          step: 0,
          salesman: null
        });
      }
    } else {
      this.setData({
        animationData: this.animation.export(),
        step: 0
      });
    }
  },
  hideGetPanel: function() {
    this.animation
      .bottom(0)
      .height(0)
      .opacity(0)
      .step();
    this.setData({
      animationData: this.animation.export(),
      salesman: null
    });
  },
  getSalesman: async function() {
    // 客户报名
    if (!this.options.scene && !this.options.sid) {
      return false;
    }
    if (this.options.scene) {
      // 扫码进的
      const query = decodeURIComponent(this.options.scene);
      const { sa } = parseQuery(query);
      // 获取业务员详情
      const [data] = await get("v1/api/sys/user", { userType: 4, autoId: sa });
      return data;
    }
    if (this.options.sid) {
      // 跳转进
      const [data] = await get("v1/api/sys/user", {
        userType: 4,
        id: this.options.sid
      });
      return data;
      // this.setData(data);
    }
  },
  customerSign: async function(e) {
    const { mobile, name } = e.detail.value;
    // 检查手机号格式
    if (mobile) {
      const msg = validateMobile(mobile);
      if (msg) {
        wx.showToast({
          title: msg,
          icon: "none"
        });
        return;
      }
    } else {
      wx.showToast({
        title: "请输入手机号",
        icon: "none"
      });
      return;
    }
    if (name) {
      const msg = validateName(name);
      if (msg) {
        wx.showToast({
          title: msg,
          icon: "none"
        });
        return;
      }
    } else {
      wx.showToast({
        title: "请输入姓名",
        icon: "none"
      });
      return;
    }
    const {
      id: activityId,
      salesman: { id: salesmanId }
    } = this.data;
    const data = await post("v1/api/sys/activityCustomers/sign", {
      activityId,
      salesmanId,
      name,
      mobile
    });
    if (data) {
      // this.setData({
      this.hideGetPanel();
      // })
      wx.showToast({
        title: "报名成功"
      });
      this.init(this.options);
    }
  },
  selectSalesman: async function(e, data) {
    let salesman = null;
    if (e) {
      salesman = e.currentTarget.dataset.item;
    } else if (data) {
      salesman = data;
    }
    if (!salesman) {
      wx.showToast({
        title: "无效客户经理",
        icon: "none"
      });
      return;
    }
    const isAuthSalesman = await this.checkSalesman(
      salesman.institutionId,
      this.data.institutionId
    );
    if (isAuthSalesman) {
      this.setData({
        salesman,
        step: 1,
        smList: null
      });
    } else {
      this.setData({
        salesman: null,
        step: 0
      });
      wx.showToast({
        title: "您的客户经理无参与该活动的权限",
        icon: "none"
      });
    }
  },
  searchSalesman: async function(e) {
    const { mobile } = e.detail.value;
    const msg = validateMobile(mobile);
    if (msg) {
      wx.showToast({
        title: msg,
        icon: "none"
      });
      return;
    }
    const salesmans = await get("v1/api/sys/user", { userType: 4, mobile });
    if (salesmans.length > 1) {
      this.setData({
        smList: salesmans
      });
    } else if (salesmans.length === 1) {
      this.selectSalesman(null, salesmans[0]);
    } else {
      wx.showToast({
        title: "根据您提供的手机号未找到客户经理",
        icon: "none"
      });
    }
  },
  checkSalesman: async function(institusionId, rootId) {
    const insts = await get("v1/api/sys/institution/getAllLevelPids", {
      id: institusionId
    });
    if (insts.includes(rootId)) {
      return true;
    } else {
      return false;
    }
  },
  setPoster: async function(data) {
    // 初始化海报信息
    // const title = `${data.name}\r\n${data.activityProducts[0].name}`
    const poster = {
      p_page: "pages/activity/speed-kill/index",
      p_title: `${data.name}\n\r${data.activityProducts[0].showName}`,
      p_scene: `?a=${data.autoId}`
    };
    // 获取海报背景
    if (data.images.length > 2) {
      const bg = data.images[2];
      poster.p_bg = `${source}${bg.url}`;
    } else {
      const bg = data.images[1];
      poster.p_bg = `${source}${bg.url}`;
    }
    // 获取场景值
    if (data.enable) {
      const user = wx.getStorageSync("user");
      if (user) {
        poster.p_scene += `&sa=${user.autoId}`;
      }
    }
    this.setData({
      ...poster
    });
  },
  changePostBg: function(index) {
    const p_bg = data.images[index + 1];
    this.setData({
      p_bg: `${source}${p_bg.url}`
    });
  },
  salesmanSign: async function(data) {
    const { sign = [], id } = data;
    const user = wx.getStorageSync('user')
    if (user.id && (sign && sign.length < 1)) {
      // 用户是业务员, 而且有权限参与但是没报名
      const res = await this.sign(id, user.id);
      return res 
    }
    return user
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
  kill: async function() {
    this.setData({
      stopKill: true
    });
    const { current, activityProducts } = this.data;
    const product = activityProducts[current];
    if (product) {
      const { id } = product;
      const data = await post("v1/api/sys/giftProduct/seckill", { id });
      if (data) {
        const activity = await this.fetch(this.options);
        this.setData({
          ...activity
        });
        wx.showModal({
          title: "恭喜您!",
          content: `抢到了${data.productName} ${data.count}件!`,
          confirmText: "去看看",
          cancelText: "知道了",
          success: function(res) {
            if (res.confirm) {
              wx.navigateTo({
                url: `/pages/personal/mySpeedKill/index?activityId=${data.activityId}&productId=${data.productId}`
              });
            }
          }
        });
      } else {
        wx.showModal({
          title: "真遗憾!",
          content:
            "没有抢到, 请持续关注活动, 您的客户经理将会在第一时间再次要请您参与抢购, 祝您好运!",
          confirmText: "知道了",
          showCancel: false
        });
      }
    } else {
      wx.showToast({
        title: "没有合法奖品"
      });
    }
    this.setData({
      stopKill: false
    });
  },
  getGifts: async function(activityId, customId) {
    return await get("v1/api/sys/giftProduct", { activityId, customId });
  },
  onShareAppMessage: function() {
    const { name, id: sid, userType } =
      this.data.user || wx.getStorageSync("user");
    const { enable, id, images, gifts } = this.data;
    const params = {
      title: `${name}邀您0元抢购`,
      imageUrl: `${source}${images[0].url}`
    };
    if (userType === 4 && enable) {
      params.path = `/pages/activity/speed-kill/index?id=${id}&sid=${sid}`;
    } else if(gifts && gifts.length > 0) {
      const salesmanId = gifts[0].salesmanId
      params.path = `/pages/activity/speed-kill/index?id=${id}&sid=${salesmanId}`;
    } else {
      params.path = `/pages/activity/speed-kill/index?id=${id}`
    }
    return params;
  }
});
