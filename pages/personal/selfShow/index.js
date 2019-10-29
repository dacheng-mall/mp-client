import moment from "moment";
import { get, put, post } from "../../../utils/request";
import {
  parseQuery,
  validateMobile,
  validateName,
  validateIdcard,
  getContHeight,
  decodeQrcodeQuery
} from "../../../utils/util";
import { source } from "../../../setting";
import regeneratorRuntime from "../../../utils/regenerator-runtime/runtime";

const PAGE_DEF = { page: 1, pageSize: 10 };

Page({
  data: {
    nvabarData: {
      showCapsule: 1, // 是否显示左上角图标   1表示显示    0表示不显示
      title: "加载中...",
      textColor: "#fff", // 标题颜色
      bgColor: "#00bcbd", // 导航栏背景颜色
      btnBgColor: "#459d9f", // 胶囊按钮背景颜色
      iconColor: "white", // icon颜色 black/white
      borderColor: "rgba(255, 255, 255, 0.3)" // 边框颜色 格式为 rgba()，透明度为0.3
    },
    user: null,
    salesman: null,
    visiable: false
  },
  onShow: function() {
    const user = wx.getStorageSync("user");
    if (user) {
      this.setData({
        user,
        _h: getContHeight()
      });
    }
    this.fetch();
  },
  fetch: async function() {
    if (this.options.scene) {
      // 扫码进的
      const query = decodeURIComponent(this.options.scene);
      const { autoId } = parseQuery(query);
      try {
        const [salesman] = await get(`v1/api/sys/user`, { autoId });
        if (salesman) {
          this.setData({
            salesman,
            isSelf: this.data.user && salesman.autoId === this.data.user.autoId,
            nvabarData: { ...this.data.nvabarData, title: salesman.name }
          });
        }
      } catch (error) {}
    } else if (this.options.autoId) {
      // 扫个人码进来的
      try {
        const [salesman] = await get(`v1/api/sys/user`, {
          autoId: this.options.autoId
        });
        if (salesman) {
          this.setData({
            salesman,
            isSelf: this.data.user && salesman.autoId === this.data.user.autoId,
            nvabarData: { ...this.data.nvabarData, title: salesman.name }
          });
        }
      } catch (error) {}
    }
  },
  makeCall: function(e) {
    const { mobile } = e.currentTarget.dataset;
    if (mobile) {
      wx.makePhoneCall({
        phoneNumber: mobile
      });
    }
  },
  showPanel: function() {
    this.setData({
      visiable: true
    });
  },
  bulk: async function() {
    const data = await post("v1/api/sys/elasticSearch/bulk", [
      {
        type: "index",
        path: { _index: "visited", _id: "1" },
        data: { name: "zxk", age: 37, gender: 1 }
      },
      {
        type: "index",
        path: { _index: "visited", _id: "2" },
        data: { name: "lx", age: 35, gender: 2 }
      },
      {
        type: "index",
        path: { _index: "visited" },
        data: { name: "zzh", age: 7, gender: 1 }
      }
    ]);
    console.log(data);
  },
  submit: async function(e) {
    const {
      id: customerId,
      name: customerName,
      autoId: customerAutoId,
      avatar: customerAvatar
    } = this.data.user;
    const {
      id: salesmanId,
      name: salesmanName,
      autoId: salesmanAutoId
    } = this.data.salesman;
    const {
      id: institutionId,
      name: institutionName,
      autoId: institutionAutoId
    } = this.data.salesman.institution;
    const body = {
      customerId,
      customerAutoId,
      customerName,
      customerAvatar,
      salesmanId,
      salesmanAutoId,
      salesmanName,
      institutionId,
      institutionName,
      institutionAutoId,
      ...e.detail
    };
    let myCustomer;
    try {
      myCustomer = await post("v1/api/sys/elasticSearch/get", {
        index: "my_customers",
        // type: `${salesmanAutoId}_customer`,
        id: `${salesmanAutoId}_${customerAutoId}`
      });
    } catch (error) {
      console.log(error);
      // if (error.statusCode === 404) {
      //   // 这个索引不存在
      // }
    }
    const tasks = [
      {
        type: "index",
        path: { _index: "visited" },
        data: body
      }
    ];
    if (!myCustomer || !myCustomer.found) {
      tasks.push({
        type: "index",
        path: {
          _index: "my_customers",
          _id: `${salesmanAutoId}_${customerAutoId}`
        },
        data: {
          userId: customerId,
          autoId: customerAutoId,
          name: customerName,
          salesmanAutoId,
          salesmanId,
          avatar: customerAvatar,
          mobile: e.detail.mobile,
          idcard: e.detail.idcard,
          visitedTimes: 1
        }
      });
    } else {
      tasks.push({
        type: "update",
        path: {
          _index: "my_customers",
          // _type: `${salesmanAutoId}_customer`,
          _id: `${salesmanAutoId}_${customerAutoId}`
        },
        data: {
          userId: customerId,
          autoId: customerAutoId,
          name: customerName,
          avatar: customerAvatar,
          mobile: e.detail.mobile,
          idcard: e.detail.idcard,
          visitedTimes: myCustomer._source.visitedTimes + 1
        }
      });
    }
    try {
      const data = await post("v1/api/sys/elasticSearch/bulk", tasks);
    } catch (error) {}
  },
  waiting: function() {
    wx.showModal({
      title: "抱歉",
      content: "功能尚未开放, 敬请期待",
      showCancel: false,
      confirmText: "知道了"
    });
  },

  bindGetUserInfo: async function(e) {
    if (e.detail.userInfo) {
      //用户按了允许授权按钮
      console.log(e.detail.userInfo);
      const { avatarUrl, ...other } = e.detail.userInfo;
      try {
        const data = await put("v1/api/sys/user", {
          id: this.data.user.id,
          ...other,
          avatar: avatarUrl
        });
        wx.setStorageSync("user", data);
        wx.showToast({
          title: "同步成功"
        });
      } catch (error) {}
    } else {
      //用户按了拒绝按钮
    }
  }
});
