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
                    wx.navigateTo({
                      url: `/${res.path}`
                    })
                    break;
                  }
                  default: {
                    wx.showToast({
                      title: "无效二维码",
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
            wx.navigateTo({
              url: '/pages/personal/myQr/index'
            })
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
    }
  }
});
