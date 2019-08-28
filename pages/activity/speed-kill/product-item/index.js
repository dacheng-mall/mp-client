import moment from "moment";
import { get } from "../../../../utils/request";
import { source } from "../../../../setting";
import regeneratorRuntime from "../../../../utils/regenerator-runtime/runtime";

const CLICK_ATTR = {
  start: null,
  timeStamp: null,
  count: 0,
  persistent: 0,
  transition: 0
};
const TIME = 500; // 点击计数时间间隔阀值, 默认500ms内点击都算是连续点击,超过500
const SIZE = 128; // 按钮默认体积
const REVIZE = 6; // 正常速率修正, 值越大越容易

Component({
  properties: {
    isLogin: {
      type: Boolean,
      value: false,
      observer: function(newVal, oldVal) {
        if (newVal !== oldVal && newVal) {
          this.getGiftsList();
        }
      }
    },
    disabled: {
      type: Boolean,
      value: false
    },
    gifts: {
      type: Array,
      value: [],
      observer: function(newVal, oldVal) {
        if (newVal.length > 0 && newVal.length !== oldVal.length) {
          const hasGift = newVal.some(
            ({ productId }) => productId === this.data.pid
          );
          this.setData({
            hasGift
          });
        }
      }
    },
    signed: {
      type: Boolean,
      value: false,
      observer: function(newVal, oldVal) {
        if (newVal !== oldVal && newVal) {
          this.createAnimation();
        }
      }
    },
    pid: {
      type: String,
      value: ""
    },
    aid: {
      type: String,
      value: ""
    },
    primaryColor: {
      type: String,
      value: ""
    },
    status: {
      type: String,
      value: "",
      observer: function(newVal) {
        if (newVal === "enable") {
          this.createAnimation();
        }
      }
    },
    beginTime: {
      type: String,
      value: "",
      observer: function(newVal, oldVal) {
        if (newVal && newVal !== oldVal) {
          this.setData({
            _beginTime: {
              date: moment(newVal).format("MM月DD日"),
              m: moment(newVal).format("HH点"),
              s:
                moment(newVal).format("mm") === "00"
                  ? ""
                  : moment(newVal).format("mm分"),
              msg: "开抢"
            }
          });
        }
      }
    },
    finishTime: {
      type: String,
      value: "",
      observer: function(newVal, oldVal) {
        if (newVal && newVal !== oldVal) {
          this.setData({
            _finishTime: {
              date: moment(newVal).format("MM月DD日"),
              m: moment(newVal).format("HH点"),
              s:
                moment(newVal).format("mm") === "00"
                  ? ""
                  : moment(newVal).format("mm分"),
              msg: "结束"
            }
          });
        }
      }
    },
    customerEnable: {
      type: Boolean,
      value: false
    },
    enable: {
      type: Boolean,
      value: false
    },
    product: {
      type: String,
      value: "",
      observer: function(newVal) {
        if (newVal) {
          newVal = JSON.parse(newVal);
          newVal.forEach((item, i) => {
            if (item.type === "image") {
              item.value = `${source}${item.value}`;
            }
          });
        }
        this.setData({
          content: newVal,
          style: this.getStyle(SIZE, 1)
        });
      }
    },
    image: {
      type: String,
      value: ""
    },
    active: {
      type: Boolean,
      value: false,
      observer: async function(newVal, oldVal) {
        if (newVal && newVal !== oldVal) {
          this.fetch(this.properties.aid, this.properties.pid);
        }
      }
    }
  },
  data: {
    source,
    transition: 0,
    CLICK_ATTR: { ...CLICK_ATTR },
    list: [],
    listCurrent: 0
  },
  lifetimes: {
    detached: function() {
      if (this.listTime) {
        clearInterval(this.listTime);
      }
      this.stopAnimation();
    }
  },
  methods: {
    getGiftsList: async function() {
      if (!this.data.isLogin) {
        return;
      }
      const timeStamp = new Date().valueOf();
      if (
        !this.data.timeStamp ||
        (this.data.timeStamp &&
          timeStamp - this.data.timeStamp >= 60000 &&
          this.data.status === "enable")
      ) {
        let data = await get("v1/api/sys/giftProduct", {
          activityId: this.data.aid,
          productId: this.data.pid
        });
        data = data.map(({ createTime, customerName, customerMobile }, i) => {
          createTime = moment(createTime).format("MM/DD HH:MM");
          customerMobile = customerMobile.replace(
            /(\d{3})\d{4}(\d{4})/,
            "$1****$2"
          );
          return {
            id: `item_${i}`,
            createTime,
            customerName,
            customerMobile
          };
        });
        this.setData({
          timeStamp,
          list: data,
          listCurrent: 0,
          listHeight: data.length > 2 ? "192rpx" : "auto",
          listAnimate: true
        });
      }
      this.listTime = setInterval(() => {
        if (this.data.listCurrent < this.data.list.length) {
          this.setData({
            listCurrent: this.data.listCurrent + 1
          });
        } else {
          this.setData({
            listAnimate: false
          });
          this.setData({
            listCurrent: 0,
            listAnimate: true
          });
          clearInterval(this.listTime);
          this.getGiftsList();
        }
      }, 1000);
    },
    createAnimation: function() {
      const { customerEnable, signed, status, isLogin } = this.data;
      if (customerEnable && signed && status === "enable" && isLogin) {
        const animation = wx.createAnimation({
          timingFunction: "ease"
        });
        this.animation = animation;
        this.timer = setInterval(() => {
          animation.scale(1.1, 1.1).step({
            duration: 100
          });
          animation.scale(1, 1).step({
            duration: 100
          });
          this.setData({
            animationData: animation.export()
          });
        }, 200);
      }
    },
    stopAnimation: function() {
      if (this.timer) {
        clearInterval(this.timer);
        this.setData({
          animationData: null
        });
      }
      if (this.listTime) {
        clearInterval(this.listTime);
      }
    },
    getStyle: (size, rate) => {
      let borderWidth = 10;
      borderWidth = Math.floor(borderWidth - (rate - 1) * borderWidth);
      let style = `border-width: ${borderWidth}px;`;
      let shadowWidth = 10;
      style += `box-shadow: 0 0 ${shadowWidth * (rate + 1)}px 0 #666;`;
      const _size = size * rate;
      style += `width: ${_size}px;height: ${_size}px;margin-left: ${_size / -2 -
        borderWidth}px;`;
      const bottom = `${(size * (1 - rate)) / 2 + 44}px`;
      style += `bottom:${bottom};`;
      return style;
    },
    reload: function() {
      this.fetch(this.data.aid, this.data.pid);
    },
    fetch: async function(activityId, productId) {
      const [data] = await get("v1/api/sys/activityProducts", {
        activityId,
        productId
      });
      if (data) {
        delete data.activity;
        const {
          beginTime,
          finishTime,
          leaveTime,
          status,
          now,
          leftStock,
          showName
        } = data;
        this.setData({
          beginTime,
          finishTime,
          leaveTime,
          status,
          now,
          leftStock,
          showName
        });
        this.createAnimation();
      } else {
        wx.showToast({
          title: "无效活动商品",
          icon: "none"
        });
      }
    },
    getProductDetail: async function(id) {
      const [data] = await get("v1/api/sys/product", { id });
      if (data) {
        this.setData({
          detail: data.content
        });
      }
    },
    checkGift: async function() {
      wx.navigateTo({
        url: `/pages/personal/mySpeedKill/index?activityId=${this.data.aid}&productId=${this.data.pid}`
      });
    },
    checkCustomers: async function() {
      const user = wx.getStorageSync("user");
      wx.navigateTo({
        url: `/pages/personal/myActivity/myCustomer?aid=${this.data.aid}&sid=${user.id}&type=at_second_kill`
      });
    },
    kill: function(e) {
      if (this.data.disabled) {
        return;
      }
      if (this.data.status !== "enable" || !this.data.isLogin) {
        return;
      }
      const animation = wx.createAnimation({
        timingFunction: "ease"
      });

      animation
        .scale(4, 4)
        .opacity(0)
        .step({
          duration: 300
        });
      // animation
      //   .scale(1, 1)
      //   .opacity(1)
      //   .step({
      //     duration: 200
      //   });

      this.setData({
        killAnimation: animation.export()
      });
      this.triggerEvent("kill");
      // 在此发送抢购请求, 这里使用以前的领取接口
      // this.setData({

      // })

      // const { timeStamp } = e;
      // const { CLICK_ATTR } = this.data;
      // if (!CLICK_ATTR.timeStamp) {
      //   // 首次点击
      //   CLICK_ATTR.start = timeStamp;
      //   CLICK_ATTR.timeStamp = timeStamp;
      //   CLICK_ATTR.count = 1;
      // } else if (timeStamp - CLICK_ATTR.timeStamp < TIME) {
      //   // 持续有效点击
      //   if (reset) {
      //     clearTimeout(reset);
      //   }
      //   CLICK_ATTR.timeStamp = timeStamp;
      //   ++CLICK_ATTR.count;
      //   // 测试计算速率
      //   const persistent = (timeStamp - CLICK_ATTR.start) / 1000; // 从首次点击现在的持续时长(秒)
      //   CLICK_ATTR.persistent = persistent;
      //   const speed = Math.round((CLICK_ATTR.count / persistent) * REVIZE); // 每秒点击次数
      //   CLICK_ATTR.transition += speed;
      //   if (CLICK_ATTR.transition < 100) {
      //     const rate = CLICK_ATTR.transition / 100 + 1;
      //     this.setData({
      //       transition: CLICK_ATTR.transition,
      //       style: this.getStyle(SIZE, rate)
      //     });
      //   } else {
      //     // 发送秒杀请求
      //     this.setData({
      //       transition: 100,
      //       style: this.getStyle(SIZE, 1),
      //       CLICK_ATTR: { ...CLICK_ATTR }
      //     });
      //   }
      // }
      // reset = setTimeout(() => {
      //   this.reset();
      // }, TIME);
    },
    reset: function() {
      this.setData({
        transition: 0,
        style: this.getStyle(SIZE, 1),
        CLICK_ATTR: { ...CLICK_ATTR }
      });
      this.createAnimation();
    }
  }
});
