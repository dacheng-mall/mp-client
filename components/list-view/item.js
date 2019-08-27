Component({
  properties: {
    data: {
      type: Object,
      value: {}
    },
    userType: {
      type: Number
    },
    width: {
      type: Number
    },
    isFirst: {
      type: Boolean
    }
  },
  relations: {
    "./index": {
      type: "parent"
    }
  },
  methods: {
    jump: function() {
      const user = wx.getStorageSync("user");
      if (!user) {
        wx.showModal({
          title: "警告",
          content: "您尚未登录, 不能使用基于个人信息的功能",
          confirmText: "授权登录",
          confirmColor: "#f00",
          cancelText: "不",
          cancelColor: "#ccc",
          success: function(res) {
            if (res.confirm) {
              wx.navigateTo({
                url: "/pages/start/author"
              });
            }
          }
        });
        return;
      }
      if (this.properties.data.path) {
        wx.navigateTo({
          url: this.properties.data.path
        });
      } else {
        wx.showToast({
          title: "此功能即将开放, 敬请期待...",
          icon: "none"
        });
      }
    }
  }
});
