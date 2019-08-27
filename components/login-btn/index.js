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
    go2login: function(){
      // const app = getApp();
      // console.log(app);
      wx.navigateTo({
        url: "/pages/start/author"
      });
    }
  }
})