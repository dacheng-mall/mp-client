import {
  parseQuery,
  validateMobile,
  validateName,
  validateIdcard,
  getContHeight
} from "../../utils/util";

Component({
  properties: {
    visiable: {
      type: Boolean,
      value: false,
      observer: function(nv, ov) {
        if (nv !== undefined && nv !== ov) {
          if (nv) {
            this.showPanel();
          } else {
            this.hidePanel();
          }
        }
      }
    },
    height: {
      type: Number
    },
    defautValue: {
      type: Object
    }
  },
  data: {
    stars: 3
  },
  lifetimes: {
    attached: function() {
      this.animation = wx.createAnimation({
        duration: 200,
        timingFunction: "ease"
      });
    }
  },
  methods: {
    showPanel: function() {
      this.animation
        .bottom(0)
        .height(this.data.height)
        .opacity(1)
        .step();
      this.setData({
        showComment: this.animation.export()
      });
    },
    hidePanel: function() {
      this.animation
        .bottom(0)
        .height(0)
        .opacity(0)
        .step();
      this.setData({
        showComment: this.animation.export(),
        visiable: false
      });
    },
    validate: function(value) {
      const { mobile, name, idCard } = value;
      // 检查手机号格式
      if (mobile) {
        const msg = validateMobile(mobile);
        if (msg) {
          wx.showToast({
            title: msg,
            icon: "none"
          });
          return false;
        }
      } else {
        wx.showToast({
          title: "请输入手机号",
          icon: "none"
        });
        return false;
      }
      if (name) {
        const msg = validateName(name);
        if (msg) {
          wx.showToast({
            title: msg,
            icon: "none"
          });
          return false;
        }
      } else {
        wx.showToast({
          title: "请输入姓名",
          icon: "none"
        });
        return false;
      }
      if (idCard) {
        const msg = validateIdcard(idCard);
        if (msg) {
          wx.showToast({
            title: msg,
            icon: "none"
          });
          return false;
        }
      }
      return true;
    },
    submit: function(e) {
      const value = e.detail.value;
      const res = this.validate(value);
      if (res) {
        // 通过验证
        value.stars = parseInt(value.stars, 10)
        this.triggerEvent("submit", value);
      }
    },
    starChange: function(e) {
      this.setData({
        stars: e.detail
      });
    },
    tagsChange: function(e) {
      const tags = e.detail
        .filter(({ status }) => status)
        .map(({ text }) => text)
        .join(",");
      this.setData({
        tags: tags
      });
    }
  }
});
