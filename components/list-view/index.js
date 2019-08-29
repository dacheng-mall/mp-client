const SPLIT = 3;

Component({
  properties: {
    data: {
      type: Array,
      value: [],
      observer: function(newVal) {
        if (newVal.length > 1) {
          const { userType } = wx.getStorageSync("user") || {};
          const { windowWidth } = wx.getSystemInfoSync();
          const res = [];
          function checkAuthor(ut) {
            return ut === null || ut === undefined || ut === userType;
          }
          newVal.forEach(val => {
            const split = val.split || 4;
            val.itemWidth = (windowWidth - (split + 1) * 10) / split;
            if (checkAuthor(val.userType)) {
              if (val.items.length > 0) {
                val.items = val.items.filter(item =>
                  checkAuthor(item.userType)
                );
              }
              res.push(val);
            }
            return val;
          });
          this.setData({
            items: res
          });
        }
      }
    }
  },
  relations: {
    "./item": {
      type: "child"
    }
  },
  methods: {
    todo: function(e) {
      this.triggerEvent("todo", e.detail);
    }
  }
});
