import { get, put } from "../../utils/request";
import { source } from "../../setting";
import regeneratorRuntime from "../../utils/regenerator-runtime/runtime";
Page({
  data: {
    invalid: '',
    type: "",
    currentKey: "",
    mainImage: null,
    source,
    keys: [
      {
        name: "详情",
        icon: "",
        key: "detail",
        disabled: false
      },
      {
        name: "关联",
        icon: "",
        key: "linked",
        disabled: false
      },
      {
        name: "编辑",
        icon: "",
        key: "editor",
        disabled: false
      }
    ]
  },
  onLoad() {
    this.fetch(this.options);
  },

  bSalesman() {
    wx.showModal({
      title: "这是我的码, 立即绑定",
      content: "感谢您使用礼全有二维码服务!",
      success: res => {
        if (res.confirm) {
          this.onSubmit({ detail: "bindSalesman" });
        }
      },
      confirmText: "立即绑定"
    });
  },
  bUser: function(userType) {
    if (userType === 4) {
      wx.showModal({
        title: "您是个经理人",
        content:
          "是否要以客户的身份领取这件商品? 一旦领取其他客户将不能再次领取! 请慎重!",
        success: res => {
          if (res.confirm) {
            this.onSubmit({ detail: "bindUser" });
          }
        },
        confirmText: "仍然要领",
        cancelText: "算了"
      });
    } else {
      wx.showModal({
        title: "我要领取",
        content: "快来把我领走吧!",
        success: res => {
          if (res.confirm) {
            this.onSubmit({ detail: "bindUser" });
          }
        },
        confirmText: "立即领取"
      });
    }
  },
  fetch: async function(options) {
    let query = "";
    if (typeof options === "string") {
      query = options;
    } else {
      const { scene, id } = options;
      if (scene) {
        query = decodeURIComponent(scene);
      } else if (id) {
        query = `?id=${id}`;
      }
    }
    const user = wx.getStorageSync("user");
    const keys = this.data.keys;
    const [data] = await get(`v1/api/sys/qr${query}`);
    if(!data) {
      wx.showToast({
        title: '无效二维码'
      })
      this.setData({
        invalid: 'yes',
      })
      return;
    }
    let initTag = "detail";
    // 先确定需要删除哪些标签
    // 如果salesmanId, institutionId, activityId, productId有任意一个, 关联常态显示
    // 如果qrType.bindSalesman === 0 不需要绑定业务员, 否则判断是否存在institutionId, 如果不存在, 所有业务员都可以绑定, 如果有institutionId, 则仅属于该机构的业务员可以绑定

    if (!data.qrType.fields) {
      // 如果data.qrType.fields为空, 不可编辑, 没有详情, 只能绑定客户和业务员
      initTag = "linked";
      keys[2].disabled = true;
      keys[0].disabled = true;
    } else if (!data.userId) {
      // 如果data.qrtype.fields存在, 但是data.fields为空, 可编辑, 暂时无内容, 未被绑定过, 无详情
      keys[0].disabled = true;
      initTag = "editor";
    } else if (data.userId === user.id) {
      // 已经绑定过了, 绑定者是当前用户
      initTag = "detail";
      keys[0].disabled = false;
    } else {
      // 已经绑定过了, 但是绑的是别人
      initTag = "detail";
      keys[0].disabled = false;
      keys[2].disabled = true;
    }
    const freeCount = keys.filter(({ disabled }) => !disabled).length;
    let canBindUser = false,
      canBindSalesman = false;
    // 绑定用户
    if (
      (user.userType === 2 ||
        (user.userType === 4 &&
          (data.salesmanId || data.qrType.bindSalesman === 0))) &&
      (!data.qrType.fields && !data.userId)
    ) {
      // 这是客户
      // 没有采集字段, 不需跳转备编辑页面, 并且没有绑定过用户
      this.bUser(user.userType);
      canBindUser = true;
    } else if (
      user.userType === 4 &&
      !data.salesmanId &&
      data.qrType.bindSalesman === 1
    ) {
      // 这是业务员, 当前码没有绑定业务员, 当前码类型强制绑定业务员
      // 如果批次里有关联机构, 那么需要验证当前用户所在机构是否是关联机构的子机构, 如果不是不允许绑定
      // 如果没关联机构, 允许所有业务员绑定
      if (data.batch.institutionId) {
        const pids = await get(
          `v1/api/sys/institution/getAllLevelPids?id=${user.institutionId}`
        );
        if (pids.includes(data.batch.institutionId)) {
          this.bSalesman();
          canBindSalesman = true;
        }
      } else {
        this.bSalesman();
        canBindSalesman = true;
      }
    }

    this.setData({
      ...data,
      currentKey: initTag,
      keys:[...keys],
      query,
      freeCount,
      canBindUser,
      canBindSalesman,
      mainImage: data.batch.imageUrl ? `${source}${data.batch.imageUrl}` : null
    });
    if (!keys[2].disabled) {
      this.initEditor();
    }
    this.initLinked();
  },
  initLinked: async function() {
    const {
      batch: { institutionId, activityId, productId }
    } = this.data;
    if (institutionId) {
      const { data } = await get(
        `v1/api/sys/institution/1/1?id=${institutionId}`
      );
      if (data.length > 0) {
        this.setData({
          institution: data[0]
        });
      }
    }
    if (activityId) {
      const { data } = await get(`v1/api/sys/activity/1/1?id=${activityId}`);
      if (data.length > 0) {
        this.setData({
          activity: data[0]
        });
      }
    }
    if (productId) {
      const { data } = await get(`v1/api/sys/product/1/1?id=${productId}`);
      if (data.length > 0) {
        this.setData({
          product: data[0]
        });
      }
    }
  },
  initEditor: function() {
    const user = wx.getStorageSync("user");
    let fields = this.data.qrType.fields;
    let value = this.data.fields;
    value = value ? JSON.parse(value) : {};
    fields = fields ? JSON.parse(fields) : fields;
    const defaultValues = {};
    if (fields) {
      fields.map(({ code }, i) => {
        // 整理初始值
        defaultValues[code] = value[code] || user[code];
      });
    }
    this.setData({
      defaultValues
    });
  },
  changeTab: function(e) {
    this.setData({
      currentKey: e.detail
    });
    if (e.detail === "editor") {
      // 初始化表单值
      this.initEditor();
    }
  },
  onSubmit: async function(e) {
    const { id } = this.data;
    const { id: userId } = wx.getStorageSync("user");
    const fields = e.detail;
    if (fields === "salesmanClear") {
      // 清空业务员信息
      const data = await put("v1/api/sys/qr", {
        id,
        salesmanId: null,
        salesmanBindTime: null
      });
      if (data.id) {
        this.fetch(this.data.query);
        wx.showToast({
          title: "解除绑定!"
        });
      }
    } else if (fields === "bindUser") {
      const data = await put("v1/api/sys/qr", {
        id,
        userId
      });
      if (data.id) {
        this.fetch(this.data.query);
        wx.showToast({
          title: "领取成功!"
        });
      }
    } else if (fields === "bindSalesman") {
      const data = await put("v1/api/sys/qr", {
        id,
        salesmanId: userId
      });
      if (data.id) {
        this.fetch(this.data.query);
        wx.showToast({
          title: "领取成功!"
        });
      }
    } else {
      const data = await put("v1/api/sys/qr", {
        id,
        userId,
        fields: JSON.stringify(fields)
      });
      if (data.id) {
        this.fetch(this.data.query);
        wx.showToast({
          title: "领取成功!"
        });
      }
    }
  },
  bindEvent: function(e) {
    const { userType } = wx.getStorageSync("user");
    switch (e.detail) {
      case "user": {
        if (this.data.qrType.fields) {
          this.setData({
            currentKey: "editor"
          });
        } else {
          this.bUser(userType);
        }
        break;
      }
      case "salesman": {
        this.bSalesman();
        break;
      }
      case "salesmanClear": {
        this.onSubmit({ detail: "salesmanClear" });
        break;
      }
    }
  }
});
