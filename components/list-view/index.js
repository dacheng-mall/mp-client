const SPLIT = 3;

Component({
  properties: {
    data: {
      type: Array,
      value: []
    }
  },
  relations: {
    "./item": {
      type: "child"
    }
  },
  lifetimes: {
    ready: function() {
      const { windowWidth } = wx.getSystemInfoSync();
      this.setData({
        itemWidth: (windowWidth - (SPLIT + 1) * 10) / SPLIT
      });
    }
  },
  methods: {}
});
