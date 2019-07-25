import { get, put, setToken } from "../../../utils/request";
import {
  validateMobile,
  validateIdcard,
  validateName
} from "../../../utils/util";
import regeneratorRuntime from "../../../utils/regenerator-runtime/runtime";

let interval = "";
let timeout = 0;
const INIT_STATE = {
  rootInst: "",
  institutionId: "",
  institutionName: "",
  grade: [],
  gradeName: null,
  role: null,
  nvabarData: {
    showCapsule: 1, // 是否显示左上角图标   1表示显示    0表示不显示
    title: '编辑机构信息', // 导航栏 中间的标题
    textColor: '#fff', // 标题颜色
    bgColor: '#00bcbd', // 导航栏背景颜色
    btnBgColor: '#459d9f', // 胶囊按钮背景颜色
    iconColor: 'white', // icon颜色 black/white
    borderColor: 'rgba(255, 255, 255, 0.3)' // 边框颜色 格式为 rgba()，透明度为0.3
  }
};

Page({
  data: { ...INIT_STATE },
  getUser: function() {
    return new Promise((resolve, rej) => {
      wx.login({
        success: res => {
          get("api/wx/token_bycode", { code: res.code })
            .then(data => {
              if (data.user) {
                wx.setStorageSync("lastTimestamp", new Date().valueOf());
                wx.setStorageSync("user", data.user);
                setToken(data.token);
                resolve(data.user);
              } else {
                // 没注册过, 请缓存, 坐等app的注册
                const app = getApp();
                app._clear();
              }
            })
            .catch(err => rej(err));
        }
      });
    });
  },
  onShow: async function() {
    let query = "";
    if (typeof this.options === "string") {
      query = this.options;
    } else {
      if (this.options.scene) {
        query = decodeURIComponent(this.options.scene);
        if (/iaid/g.test(query)) {
          query = query.replace(/iaid/g, "autoId");
        }
      }
    }
    await this.firstIn(query);
    // 选过机构后初始化职级的逻辑
    if (!query) {
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
    }
  },
  firstIn: async function(query) {
    const user = await this.getUser();
    if (user) {
      const params = {
        user
      };
      if (user.userType === 4) {
        if (query) {
          wx.switchTab({
            url: "/pages/personal/index"
          });
          return;
        }
        const { name, id } = user.institution;
        params.institutionId = id;
        params.institutionName = name;
        await this.initGrades(id, user.gradeId, user.gradeName);
      } else if (query) {
        // 这是普通用户, 而且还有query, 扫码进来的, 挂载了机构的autoId
        params.disabled = true;
        const {
          data: [institution]
        } = await get(`v1/api/sys/institution/1/1${query}`);
        if (institution) {
          params.institutionId = institution.id;
          params.institutionName = institution.name;
          this.initGrades(institution.id);
        }
      }
      this.setData({
        ...params
      });
    }
  },
  onUnload: function() {
    this.setData({ ...INIT_STATE });
  },
  initGrades: async function(insId, gid, gname) {
    const grade = await get(`v1/api/sys/grade/findGradesByInsId`, { insId });
    if (grade && gid && gname) {
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
    } else if (grade) {
      this.setData({
        grade
      });
    }
  },
  pickInst() {
    if (this.data.disabled) {
      return;
    }
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
      // case !value.gradeId: {
      //   wx.showToast({ title: "未选择职级", icon: "none" });
      //   return;
      // }
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
        wx.setStorageSync("user", data);
        wx.setStorageSync("force", true);
        wx.switchTab({
          url: "/pages/personal/index"
        });
      } catch (e) {}
    }
  }
});
