import { get, put } from "../../../utils/request";
import regeneratorRuntime from "../../../utils/regenerator-runtime/runtime";

Page({
  data: {
    rootInst: "",
    institutionId: "",
    institutionName: "",
    grade: [],
    gradeName: null
  },
  onShow() {
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
  pickInst() {
    wx.navigateTo({
      url: "/pages/personal/bind/instList?pid=&delta=1"
    });
  },
  fetchGrade: async function(rootInst) {
    const data = await get("v1/api/sys/grade", { institutionId: rootInst });
    if (data.length < 1) {
      wx.showModal({
        title: "数据异常",
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
    if(this.data.grade.length > 0) {
      const index = value.gradeId;
      value.gradeId = this.data.grade[index].id;
      value.gradeName = this.data.grade[index].name;
    }
    const user = wx.getStorageSync('user');
    value.id = user.id;
    value.userType = 4;
    const data = await put("v1/api/sys/user", value);
    console.log(data);
    if(data.userType === 4) {
      wx.showToast('已加入机构')
      wx.setStorageSync("user", data);
      wx.navigateBack(1);
    }
  }
});
