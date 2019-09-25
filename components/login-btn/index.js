Component({
  properties: {
    navbarData: {
      // navbarData 由父页面传递的数据
      type: Object,
      value: {},
      observer: function(newVal, oldVal) {}
    }
  },
  methods: {
    go2login: function() {
      wx.navigateTo({
        url: "/pages/start/author"
      });
    }
  }
});
