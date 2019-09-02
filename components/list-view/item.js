import { notice } from "../../utils/util";
import { SPLIT, GUTTER } from './index';

Component({
  properties: {
    data: {
      type: Object,
      value: {},
      observer: function(newVal) {
        if(newVal.size > 1){
          this.setData({
            width: newVal.size * this.properties.width + (newVal.size - 1) * 10
          })
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
      if (this.properties.data.path) {
        console.log('this.properties.data.path', this.properties.data.path)
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
