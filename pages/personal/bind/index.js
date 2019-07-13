import { get, put } from "../../../utils/request";
import {
  validateMobile,
  validateIdcard,
  validateName
} from "../../../utils/util";
import regeneratorRuntime from "../../../utils/regenerator-runtime/runtime";

const INIT_STATE = {
  rootInst: "",
  institutionId: "",
  institutionName: "",
  grade: [],
  gradeName: null,
  role: null
};

Page({
  data: { ...INIT_STATE },
  onShow: async function() {
    const user = wx.getStorageSync("user");
    if (!this.data.user) {
      const params = {
        user
      };
      if (user.userType === 4) {
        const { name, id } = user.institution;
        params.institutionId = id;
        params.institutionName = name;
        await this.initGrades(id, user.gradeId, user.gradeName);
      }
      this.setData({
        ...params
      });
    }
    const timer = setTimeout(() => {
      const rootInst = wx.getStorageSync("bind_rootid");
      const institutionId = wx.getStorageSync("bind_id");
      const institutionName = wx.getStorageSync("bind_name");
      if (rootInst && institutionId) {
        this.setData({
          rootInst,
          institutionId,
          institutionName,
          grade: null,
          gradeName: null
        });
        this.fetchGrade(rootInst);
      }
      clearTimeout(timer);
    }, 0);
  },
  onUnload: function() {
    this.setData({ ...INIT_STATE });
  },
  initGrades: async function(insId, gid, gname) {
    const grade = await get(`v1/api/sys/grade/findGradesByInsId`, { insId });
    let gradeIndex = 0;
    grade.forEach(({ id }, i) => {
      if (id === gid) {
        gradeIndex = i;
        return;
      }
    });
    this.setData({
      grade,
      gradeIndex,
      gradeName: gname
    });
  },
  pickInst() {
    wx.navigateTo({
      url: "/pages/personal/bind/instList?pid=&delta=1"
    });
  },
  fetchGrade: async function(rootInst) {
    const data = await get("v1/api/sys/grade", { institutionId: rootInst });
    if (data.length < 1) {
      wx.showModal({
        title: "警告!",
        content: "您选择的机构没有职级数据, 请联系机构管理员添加职级信息"
      });
    } else {
      this.setData({
        grade: data
      });
    }
  },
  changeGrade(e) {
    const { value } = e.detail;
    const gradeName = this.data.grade[value].name;
    this.setData({
      gradeName
    });
  },
  formSubmit: async function(e) {
    const { value } = e.detail;
    value.institutionId = this.data.institutionId;
    if (this.data.grade.length > 0) {
      const index = value.gradeId;
      if (this.data.grade[index]) {
        value.gradeId = this.data.grade[index].id;
        value.gradeName = this.data.grade[index].name;
      }
    }
    const user = wx.getStorageSync("user");
    value.id = user.id;
    value.userType = 4;
    switch (true) {
      case !value.institutionId: {
        wx.showToast({ title: "未选择机构", icon: "none" });
        return;
      }
      case !value.gradeId: {
        wx.showToast({ title: "未选择职级", icon: "none" });
        return;
      }
      case !value.name: {
        wx.showToast({ title: "未录入真实姓名", icon: "none" });
        return;
      }
      case !value.mobile: {
        wx.showToast({ title: "未录入手机号", icon: "none" });
        return;
      }
      case !value.code: {
        wx.showToast({ title: "未录入工号", icon: "none" });
        return;
      }
    }

    if (value.mobile) {
      const msg = validateMobile(value.mobile);
      if (msg) {
        wx.showToast({
          title: msg,
          icon: "none"
        });
        return;
      }
    }
    if (value.name) {
      const msg = validateName(value.name);
      if (msg) {
        wx.showToast({
          title: msg,
          icon: "none"
        });
        return;
      }
    }
    if (value.idCard) {
      const msg = validateIdcard(value.idCard);
      if (msg) {
        wx.showToast({
          title: msg,
          icon: "none"
        });
        return;
      }
    }
    const data = await put("v1/api/sys/user", value);
    if (data.userType === 4) {
      try {
        wx.showToast("已加入机构");
        wx.removeStorage({ key: "bind_rootid" });
        wx.removeStorage({ key: "bind_id" });
        wx.removeStorage({ key: "bind_name" });
        wx.setStorageSync('user', data);
        wx.setStorageSync('force', true);
        wx.switchTab({
          url: "/pages/personal/index"
        });
      } catch (e) {}
    }
  }
});
