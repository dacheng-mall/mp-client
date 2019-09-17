import { source } from "../../setting";
import { notice } from "../../utils/util";
import { post } from "../../utils/request";

Component({
  data: {
    source
  },
  properties: {
    data: {
      type: Object,
      value: {},
      observer: function(newVal) {
        console.log("newVal", newVal);
        if (newVal.size > 1) {
          this.setData({
            width:
              newVal.size * this.properties.width +
              (newVal.size - 1) * (this.properties.gutter || 10)
          });
        }
      }
    },
    userType: {
      type: Number
    },
    width: {
      type: Number
    },
    height: {
      type: Number
    },
    index: {
      type: Number
    },
    isRowEnd: {
      type: Boolean
    }
  },
  relations: {
    "./index": {
      type: "parent"
    }
  },
  methods: {
    tap: function() {
      const user = wx.getStorageSync("user");
      if (!user) {
        notice();
        return;
      }
      if (this.properties.data.type === "function") {
        switch (this.properties.data.id) {
          case "scan": {
            // 扫码
            wx.scanCode({
              onlyFromCamera: true,
              success: function(res) {
                console.log(res);
                switch (res.scanType) {
                  case "QR_CODE": {
                    break;
                  }
                  case "WX_CODE": {
                    break;
                  }
                  default: {
                    wx.showToast({
                      title: "只能扫二维码或小程序码",
                      icon: "none"
                    });
                  }
                }
              },
              fail: function() {
                wx.showToast({
                  title: "扫码失败, 请重试",
                  icon: "none"
                });
              }
            });
            break;
          }
          case "code-personal": {
            // 个人码
            // 老子想缓存个人码到缓存里, 缓存一个本地的地址到localstorage
            // 是否可以不缓存?
            // 先不缓存, 每次重新生成, 带上时间戳
            const ts = new Date().valueOf();
            // post('v1/api/wx/createWXAQRCode', { page: 'pages/qrcode/index', scene: `?said=${user.autoId}&ts=${ts}` }).then((blobObj) => {
            //   const src = `data:image/jpg;base64,${blobObj}`
            //   wx.
            // })
            break;
          }
          case "infomation": {
            // 个人信息
            // 跳转注册页面, 如果没有注册成为业务员, 需要跳到一个中间页面, 这个中间页面负责中转
            // 如果已经注册成功了, 提供修改个人信息功能, 否则提供邀请码(机构识别码)绑定机构功能
            wx.navigateTo({
              url: "/pages/personal/bind/index"
            });
            break;
          }
        }
        return;
      } else {
        const { id, type } = this.properties.data;
        if (id && type) {
          wx.navigateTo({
            url: `/pages/${type}/detail?id=${id}`
          });
        } else {
          wx.showToast({
            title: "此功能即将开放, 敬请期待...",
            icon: "none"
          });
        }
      }
      // if (this.properties.data.path) {
      //   wx.navigateTo({
      //     url: this.properties.data.path
      //   });
      // } else if (this.properties.data.todo) {
      //   this.triggerEvent("todo", { type: this.properties.data.todo });
      // } else {
      // }
    }
  }
});
