import { notice } from "../../utils/util";

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
    isSplit: {
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
      if (this.properties.data.path) {
        wx.navigateTo({
          url: this.properties.data.path
        });
      } else if (this.properties.data.todo) {
        this.triggerEvent("todo", { type: this.properties.data.todo });
      } else {
        wx.showToast({
          title: "此功能即将开放, 敬请期待...",
          icon: "none"
        });
      }
    }
  }
});
