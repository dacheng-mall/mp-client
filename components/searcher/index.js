Component({
  properties: {
    defaultValue: {
      type: String,
      value: ""
    },
    placeholder: {
      type: String,
      value: "请输入关键字"
    }
  },
  data: {
    value: ""
  },
  lifetimes: {
    ready() {
      this.setData({
        value: this.properties.defaultValue
      });
    }
  },
  methods: {
    touch(){
      wx.navigateTo({
        url: '/pages/filter/index'
      })
    },
    submit(event) {
      this.triggerEvent("submit", { value: event.detail.value });
    }
  }
});
