import { get, post } from "../../utils/request";
import {
  validateMobile,
  validateName,
  getContHeight
} from "../../utils/util";
import regeneratorRuntime from "../../utils/regenerator-runtime/runtime";

Component({
  properties: {
    // 业务员id
    sid: {
      type: String
    },
    // 活动主办机构id
    instId: {
      type: String
    },
    // 活动id
    aid: {
      type: String
    },
    // 报名按钮名称
    title: {
      type: String,
      value: "立即报名"
    },
    styles: {
      type: String,
      value: "",
    }
  },
  data: {
    step: 0,
    salesman: null,
    height: 0,
    width: 0
  },
  lifetimes: {
    attached: function() {
      this.animation = wx.createAnimation({
        duration: 200,
        timingFunction: "ease"
      });
      this.getContHeight();
    },
    detached: function() {}
  },
  methods: {
    getContHeight: function() {
      const { windowWidth: width } = wx.getSystemInfoSync();
      this.setData({
        height: getContHeight(),
        width
      });
    },
    /**
     * 获取业务员信息
     * @param {String} sid
     * @returns {Object} 业务员信息
     */
    getSalesman: async function(sid) {
      if (!sid) {
        return false;
      }
      const [data] = await get("v1/api/sys/user", {
        userType: 4,
        autoId: sid
      });
      return data;
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
    /**
     * 点击报名按钮后,弹出采集信息的面板
     */
    showPanel: async function() {
      // 先定义动画
      this.animation
        .bottom(0)
        .height(this.data.height)
        .opacity(1)
        .step();
      // 请求业务员信息, 有可能时没有权限的业务员
      const salesman = await this.getSalesman(this.data.sid);
      if (salesman) {
        // 拿到业务员信息后,
        const isAuthSalesman = await this.checkSalesman(
          salesman.institutionId,
          this.data.instId
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
    search: async function(e) {
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
        this.selected(null, salesmans[0]);
      } else {
        wx.showToast({
          title: "根据您提供的手机号未找到客户经理",
          icon: "none"
        });
      }
    },
    checkSalesman: async function(institusionId, rootId) {
      if (!rootId) {
        throw "checkSalesman, 活动主办方机构id缺失";
      }
      if (!institusionId) {
        throw "checkSalesman, 业务员所在机构id缺失";
      }
      const insts = await get("v1/api/sys/institution/getAllLevelPids", {
        id: institusionId
      });
      if (insts.includes(rootId)) {
        return true;
      } else {
        return false;
      }
    },
    selected: async function(e, data) {
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
        this.data.instId
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
    sign: async function(e) {
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
        aid: activityId,
        salesman: { id: salesmanId }
      } = this.data;
      const data = await post("v1/api/sys/activityCustomers/sign", {
        activityId,
        salesmanId,
        name,
        mobile
      });
      if (data) {
        this.hideGetPanel();
        wx.showToast({
          title: "报名成功"
        });
        this.triggerEvent("afterSign", data);
      }
    }
  }
});
