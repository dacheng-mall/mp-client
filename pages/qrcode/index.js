import { get, put } from "../../utils/request";
import { source } from "../../setting";
import regeneratorRuntime from "../../utils/regenerator-runtime/runtime";
Page({
  data: {
    invalid: "",
    type: "",
    currentKey: "",
    mainImage: null,
    source,
    nvabarData: {
      showCapsule: 1, // 是否显示左上角图标   1表示显示    0表示不显示
      title: '码详情',
      textColor: "#fff", // 标题颜色
      bgColor: "#00bcbd", // 导航栏背景颜色
      btnBgColor: "#459d9f", // 胶囊按钮背景颜色
      iconColor: "white", // icon颜色 black/white
      borderColor: "rgba(255, 255, 255, 0.3)" // 边框颜色 格式为 rgba()，透明度为0.3
    },
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
  // 业务员绑定码
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
    if (!data) {
      wx.showToast({
        title: "无效二维码"
      });
      this.setData({
        invalid: "yes"
      });
      return;
    }
    let initTag = "detail";
    // 先确定需要删除哪些标签
    // 如果salesmanId, institutionId, activityId, productId有任意一个, 关联常态显示
    // 如果qrType.bindSalesman === 0 不需要绑定业务员, 否则判断是否存在institutionId, 如果不存在, 所有业务员都可以绑定, 如果有institutionId, 则仅属于该机构的业务员可以绑定
    // qrType.bindSalesman 0: 不绑定业务员, 1: 强制绑定业务员; 2: 强制绑定业务员,只能业务员修改绑定信息; 3: 强制绑定业务员,业务员和客户都能修改
    const alert4MMissingSalesman = (bindSalesman, data) => {
      if(bindSalesman > 0 && bindSalesman !== 2 && !data.salesmanId) {
        // 这都是要强制绑定业务员的, 如果这个码没有绑定业务员, 不允许客户提交信息
        initTag = "linked";
        keys[2].disabled = true;
        wx.showModal({
          title: '无效二维码',
          content: '未绑定客户经理, 请联系您的客户经理及时绑定',
          showCancel: false,
          confirmText: '知道了'
        })
      }
    }
    switch (user.userType) {
      case 2: {
        const { bindSalesman } = data.qrType;
        // 这是客户
        if (!data.qrType.fields) {
          // 如果data.qrType.fields为空, 不可编辑, 没有详情, 只能绑定客户和业务员
          initTag = "linked";
          keys[0].disabled = true;
          keys[1].disabled = false;
          keys[2].disabled = true;
        } else if (!data.userId) {
          // 如果data.qrtype.fields存在, 但是data.fields为空, 可编辑, 暂时无内容, 未被绑定过, 无详情
          switch (bindSalesman) {
            case 0:
            case 1:
            case 3: {
              // 不强制绑定业务员信息的时候, 采集信息作为公开信息, 所有用户可见
              initTag = "editor";
              keys[0].disabled = true;
              break;
            }
            case 2: {
              this.bUser(2);
              initTag = "linked";
              keys[0].disabled = true;
              keys[2].disabled = true;
              break;
            }
          }
          alert4MMissingSalesman(bindSalesman, data);
          keys[1].disabled = false;
        } else if (data.userId === user.id) {
          // 已经绑定过了, 绑定者是当前用户
          switch (bindSalesman) {
            case 0:
            case 1:
            case 3: {
              initTag = "detail";
              keys[2].disabled = false;
              break;
            }
            default: {
              // 仅业务员可以编辑的信息
              initTag = "linked";
              keys[2].disabled = true;
              break;
            }
          }
          keys[0].disabled = false;
          keys[1].disabled = false;
        } else {
          // 已经绑定过了, 但是绑的是别人
          switch (bindSalesman) {
            case 0: {
              initTag = "detail";
              keys[0].disabled = false;
              keys[2].disabled = true;
              break;
            }
            default: {
              initTag = "linked";
              keys[0].disabled = true;
              keys[2].disabled = true;
              break;
            }
          }
          keys[1].disabled = false;
        }
        break;
      }
      case 4: {
        // 这是业务员
        if (!data.qrType.fields) {
          // 如果data.qrType.fields为空, 不可编辑, 没有详情, 只能绑定客户和业务员
          initTag = "linked";
          keys[0].disabled = true;
          keys[1].disabled = false;
          keys[2].disabled = true;
        } else if (!data.salesmanId) {
          // 如果data.qrtype.fields存在, 需要采集信息, 无业务员信息
          // 此时业务员需要会接收到绑定询问, 可以不绑, 可以作为客户绑定
          if (!data.userId) {
            // 没有客户绑定过
            // 当前业务员作为客户领取了码
            initTag = "editor";
            keys[0].disabled = true;
            keys[1].disabled = false;
            switch (data.qrType.bindSalesman) {
              case 2: {
                // 业务员可编辑
                initTag = "linked";
                keys[2].disabled = true;
                break;
              }
              default: {
                // 客户或业务员可编辑
                keys[2].disabled = false;
                break;
              }
            }
          alert4MMissingSalesman(data.qrType.bindSalesman, data);
          } else if (data.userId && data.userId === user.id) {
            // 当前业务员作为客户领取了码
            switch (data.qrType.bindSalesman) {
              case 0:
              case 1: {
                // 客户可编辑
                initTag = "editor";
                keys[2].disabled = false;
                break;
              }
              case 2:
              // 业务员可编辑
              case 3: {
                // 业务员和客户均可编辑
                initTag = "detail";
                keys[2].disabled = true;
                break;
              }
            }
            keys[0].disabled = false;
            keys[1].disabled = false;
          } else {
            // 当前业务员作扫了其他客户领取过的码
            initTag = "detail";
            keys[0].disabled = false;
            keys[1].disabled = false;
            keys[2].disabled = true;
          }
        } else if (data.salesmanId === user.id) {
          // 已经绑定过业务员, 且绑定者是当前用户
          if (!data.userId) {
            initTag = "linked";
            keys[0].disabled = true;
          } else {
            initTag = "detail";
            keys[0].disabled = false;
          }
          keys[1].disabled = false;
          switch (data.qrType.bindSalesman) {
            case 0:
            case 1: {
              // 客户可编辑
              keys[2].disabled = true;
              break;
            }
            case 2:
            // 业务员可编辑
            case 3: {
              // 业务员和客户均可编辑
              keys[2].disabled = false;
              break;
            }
          }
        } else {
          // 已经绑定其他业务员了(salesmanId不是自己的)
          if (!data.userId) {
            // 无客户信息, 业务员可以作为客户领取码
            switch (data.qrType.bindSalesman) {
              case 2: {
                // 仅业务员可编辑
                initTag = "linked";
                keys[2].disabled = true;
                break;
              }
              case 0:
              case 1:
              // 客户可编辑
              case 3: {
                // 业务员和客户均可编辑
                initTag = "editor";
                keys[2].disabled = false;
                break;
              }
            }

            keys[0].disabled = true;
            keys[1].disabled = false;
          } else if (data.userId === user.id) {
            // 业务员作为客户领取了其他业务员的码
            if (data.qrType.bindSalesman === 2) {
              // 仅允许业务员采集信息的
              initTag = "detail";
              keys[2].disabled = true;
            } else {
              // 强绑业务员, 不能看其他同行的客户信息
              initTag = "editor";
              keys[2].disabled = false;
            }
            keys[0].disabled = false;
            keys[1].disabled = false;
          } else {
            // 有客户信息, 业务员作为第三方客户, 查看采集信息
            if (data.qrType.bindSalesman === 0) {
              // 不强绑业务员, 被视为客户采集信息是公开的(商品类型的码, 比如挪车码)
              initTag = "detail";
              keys[0].disabled = false;
            } else {
              // 强绑业务员, 不能看其他同行的客户信息
              initTag = "linked";
              keys[0].disabled = true;
            }
            // 可以看关联信息, 但不能编辑
            keys[1].disabled = false;
            keys[2].disabled = true;
          }
        }
        break;
      }
      default: {
        initTag = "detail";
        keys[0].disabled = false;
        keys[1].disabled = false;
        keys[2].disabled = true;
        break;
      }
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
      data.qrType.bindSalesman > 0
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
      keys: [...keys],
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
    // const user = wx.getStorageSync("user");
    let fields = this.data.qrType.fields;
    let value = this.data.fields;
    value = value ? JSON.parse(value) : {};
    fields = fields ? JSON.parse(fields) : fields;
    const defaultValues = {};
    if (fields) {
      fields.map(({ code }, i) => {
        // 整理初始值, 不自动填入用户的name
        // if (code !== "name") {
        //   defaultValues[code] = value[code] || user[code];
        // }
        // 不自动回填用户信息
        defaultValues[code] = value[code];
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
    const {
      id,
      userId: qrUserId,
      qrType: { bindSalesman },
      salesmanId
    } = this.data;
    const { id: userId, userType } = wx.getStorageSync("user");
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
      const params = {
        id,
        salesmanId: userId
      };
      if (qrUserId && qrUserId === userId) {
        // 如果已经绑定过客户, 且绑定的客户信息是即将绑定的业务员, 此时清掉客户信息
        params.userId = null;
        params.userBindTime = null;
        params.fields = null;
      }
      const data = await put("v1/api/sys/qr", params);
      if (data.id) {
        this.fetch(this.data.query);
        wx.showToast({
          title: "领取成功!"
        });
      }
    } else {
      // 有采集信息的
      const params = {
        id,
        fields: JSON.stringify(fields)
      };
      switch (bindSalesman) {
        case 0:
        case 1: {
          // 仅允许客户绑定的
          params.userId = userId;
          break;
        }
        case 2: {
          // 仅允许业务员绑定的
          params.salesmanId = userId;
          break;
        }
        case 3: {
          // 允许业务员或客户绑定的
          if (salesmanId === userId) {
            // 如果当前
            params.salesmanId = userId;
          } else {
            params.userId = userId;
          }
          break;
        }
      }
      const data = await put("v1/api/sys/qr", params);
      if (data.id) {
        this.fetch(this.data.query);
        wx.showToast({
          title: "提交信息成功!"
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
