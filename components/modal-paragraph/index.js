import { getContHeight } from "../../utils/util";
Component({
  properties: {
    source: {
      type: String
    },
    data: {
      type: String,
      observer: function(newVal, oldVal) {
        if (newVal && newVal !== oldVal) {
          const cont = JSON.parse(newVal).map((item, i) => {
            if (item.type === "image") {
              item.value = `${this.data.source}${item.value}`;
            }
            return item;
          });
          this.setData({
            content: cont
          });
        }
      }
    },
    text: {
      type: String,
      value: "暂无内容"
    },
    styles: {
      type: String,
      value: ""
    },
    title: {
      type: String,
      value: "说明"
    }
  },
  data: {
    cont: []
  },
  lifetimes: {
    attached: function() {
      this.animation = wx.createAnimation({
        timingFunction: "ease"
      });
    }
  },
  methods: {
    trigger: function() {
      const { visible } = this.data;
      if (visible) {
        this.animation
          .opacity(0)
          .bottom('-100px')
          .height(0)
          .step({
            duration: 300
          });
      } else {
        this.animation
          .opacity(1)
          .bottom(0)
          .left(0)
          .height(getContHeight())
          .step({
            duration: 300
          });
      }
      this.setData({
        visible: !visible,
        animation: this.animation.export()
      });
    }
  }
});
