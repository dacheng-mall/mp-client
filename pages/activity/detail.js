// import _ from 'lodash';
import { get, post, put } from "../../utils/request";
import moment from "moment";
import { uri, getRoute, parseQuery, getContHeight } from "../../utils/util";
import { source } from "../../setting";
import regeneratorRuntime from "../../utils/regenerator-runtime/runtime";
const validateMobile = /^1(3|4|5|7|8)\d{9}$/;

const app = getApp();
Page({
  data: {
    source,
    iWantThem: [], //用户想要领取的礼物,
    step: null,
    nvabarData: {
      showCapsule: 1, // 是否显示左上角图标   1表示显示    0表示不显示
      title: '活动详情',
      textColor: "#fff", // 标题颜色
      bgColor: "#00bcbd", // 导航栏背景颜色
      btnBgColor: "#459d9f", // 胶囊按钮背景颜色
      iconColor: "white", // icon颜色 black/white
      borderColor: "rgba(255, 255, 255, 0.3)" // 边框颜色 格式为 rgba()，透明度为0.3
    }
  },
  onShow: function() {
    wx.hideShareMenu();
    this.getContHeight();
    const user = wx.getStorageSync("user");
    this.setData({
      user,
      showHome: true
    });
    if (this.options.scene) {
      // 扫码进的
      const query = decodeURIComponent(this.options.scene);
      const { a, sa } = parseQuery(query);
      this.fetch({ a, sa });
    } else {
      // 跳转进
      this.fetch(this.options);
    }
    // 初始化动画
    this.animation = wx.createAnimation({
      duration: 200,
      timingFunction: "ease"
    });
  },
  
  getContHeight: function() {    
    this.setData({
      contHeight: getContHeight()
    });
  },
  showGetPanel: function() {
    this.animation
      .bottom(0)
      .height(this.data.contHeight)
      .opacity(1)
      .step();
    // 如果有业务员id则直接选礼物, 否则到选择业务员的界面
    this.setData({
      animationData: this.animation.export(),
      step: this.data.salesmanId ? 1 : 0
    });
  },
  hideGetPanel: function() {
    this.animation
      .bottom(0)
      .height(0)
      .opacity(0)
      .step();
    this.setData({
      animationData: this.animation.export(),
      step: null
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
    if (this.data.iWantThem.length < 1) {
      // 如果没有选择礼品, 不允许继续进行
      wx.showToast({
        title: "请选择礼品",
        icon: "none"
      });
      return;
    }
    // 如果需要返回首页, 调用hideGetPanel(), 关闭弹出面板, 并返回首页
    if (next === null) {
      // this.hideGetPanel();
      this.formSubmit();
      return;
    }
    // 否则, 到下一步, 采集用户信息
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
  fetch: async function({ id, sid, a, sa }) {
    let data = null;
    if (id) {
      [data] = await get("v1/api/sys/activity", { id });
    } else if (a) {
      [data] = await get("v1/api/sys/activity", { autoId: a });
    }
    if (data) {
      switch(data.activityType){
        case 'at_second_kill': {
          wx.redirectTo({
            url: `/pages/activity/speed-kill/index?id=${data.id}`
          })
          return
        }
        case 'at_lottery': {
          wx.redirectTo({
            url: `/pages/activity/lottery/index?id=${data.id}`
          })
          return
        }
      }
      // if(data.activityType === 'at_second_kill') {
      //   return
      // }
      const { screenWidth, windowHeight } = wx.getSystemInfoSync();
      data.dateStart = moment(data.dateStart).format("YYYY-MM-DD");
      data.dateEnd = moment(data.dateEnd).format("YYYY-MM-DD");
      data.createTime = moment(data.createTime).format("YYYY-MM-DD");
      if (data.description) {
        data.description = this.normalizeDescription(data.description);
      }
      // 初始化海报信息
      const poster = {
        p_page: "pages/activity/detail",
        p_title: data.name,
        p_scene: `?a=${data.autoId}`
      };
      // 获取海报背景
      const [lastImg] = data.images.splice(data.images.length - 1, 1);
      poster.p_bg = `${source}${lastImg.url}`;
      // 获取场景值
      if (data.enable) {
        const user = wx.getStorageSync("user");
        if (user) {
          poster.p_scene += `&sa=${user.autoId}`;
        }
      }
      this.setData({
        ...data,
        ...poster,
        width: screenWidth,
        height: windowHeight
      });
      // 暂不请求可参与职级列表
      // this.fetchGrades(data.institutionId, data.grades);
    }
    switch (data.activityType) {
      case "at_book": {
        // 如果是预约类型的活动
        if (
          this.data.user.userType === 4 &&
          this.data.enable &&
          data.sign &&
          data.sign.length < 1
        ) {
          // 用户时业务员, 而且没有注册, 主动注册
          this.sign();
        }
        break;
      }
      default: {
      }
    }
    if (sid || sa) {
      this.fetchSaleman(sid, sa);
    } else {
      this.setData({
        step: null
      });
    }
  },
  normalizeDescription: function(json) {
    try {
      const text = JSON.parse(json);
      const res = text.map((item, i) => {
        switch (item.type) {
          case "text": {
            const t = {
              name: "div",
              attrs: { style: "" },
              children: [
                {
                  type: "text",
                  text: item.value
                }
              ]
            };
            for (let key in item) {
              switch (key) {
                case "align": {
                  t.attrs.style += `text-align:${item[key]};`;
                  break;
                }
                case "italic": {
                  if (item[key]) {
                    t.attrs.style += `font-style:italic;`;
                  }
                  break;
                }
                case "throughline": {
                  if (item[key]) {
                    if (/text-decoration:underline;/.test(t.attrs.style)) {
                      t.attrs.style = t.attrs.style.replace(
                        /text-decoration:underline;/g,
                        "text-decoration:underline line-through;"
                      );
                    } else {
                      t.attrs.style += `text-decoration:line-through;`;
                    }
                  }
                  break;
                }
                case "underline": {
                  if (item[key]) {
                    if (/text-decoration:line-through;/.test(t.attrs.style)) {
                      t.attrs.style = t.attrs.style.replace(
                        /text-decoration:line-through;/g,
                        "text-decoration:line-through underline;"
                      );
                    } else {
                      t.attrs.style += `text-decoration:underline;`;
                    }
                  }
                  break;
                }
                case "padding": {
                  t.attrs.style += `padding:${item[key]}px;`;
                  break;
                }
                case "size": {
                  t.attrs.style += `font-size:${item[key]}px;`;
                  break;
                }
                case "weight": {
                  if (item[key]) {
                    t.attrs.style += `font-weight:bold;`;
                  }
                  break;
                }
              }
            }
            return t;
          }
          case "image": {
            const img = {
              name: "img",
              attrs: { style: "width:100%", src: `${source}${item.value}` }
            };
            return img;
          }
          case "list": {
            const ul = {
              name: "ul",
              attrs: {},
              children: []
            };
            item.value.forEach(({ label, content }, i) => {
              const lab = {
                name: "div",
                attrs: { style: "position:absolute;left:0;top:0;width:128px;" },
                children: [
                  {
                    type: "text",
                    text: label
                  }
                ]
              };
              const cont = {
                name: "div",
                children: [
                  {
                    type: "text",
                    text: content
                  }
                ]
              };
              const li = {
                name: "li",
                attrs: { style: "position:relative;padding-left:128px;" },
                children: [lab, cont]
              };
              ul.children.push(li);
            });
            return ul;
          }
          default: {
          }
        }
      });
      return res;
    } catch (e) {}
  },
  fetchSaleman: async function(id, autoId) {
    let data = null;
    if (id) {
      data = await get(`v1/api/sys/user/${id}`);
    } else if (autoId) {
      [data] = await get(`v1/api/sys/user`, { autoId });
    }
    if (data) {
      this.setData({
        salesmanId: data.id,
        salesman: data,
        step: null
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
    // 如果不需要采集用户信息activityType === 'at_book', 仅预约
    if (this.data.activityType === "at_gift") {
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
      }
    }
    const baseInfo = {
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
    baseInfo.products = [];
    this.data.products.map(prod => {
      if (prod.checked) {
        baseInfo.products.push({
          productId: prod.id,
          productName: prod.name || prod.title,
          count: prod.totalCount
        });
      }
    });
    try {
      const gifts = await post("v1/api/sys/giftNew", baseInfo);
      if (gifts) {
        this.setData({
          gifts,
          customCount: this.data.customCount + 1
        });
        this.hideGetPanel();
      }
    } catch (e) {}
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
  gotoMyGifts: function(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/personal/myGift/index?id=${id}`
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
  },
  showHome: function() {
    wx.switchTab({
      url: "/pages/home/index"
    });
  },
  productDetail: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/products/detail/index?id=${id}`
    });
  }
});
