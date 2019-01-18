const { source } = require("../../../setting");
module.exports = Behavior({
  behaviors: [],
  properties: {
    data: {
      type: Object,
      observer: function(val) {
        const attributes = val.attributes && JSON.parse(val.attributes);
        const attr = {};
        if (attributes) {
          for (let key in attributes) {
            switch (key) {
              case "rate": {
                const { windowWidth } = wx.getSystemInfoSync();
                attr.height = attributes[key][1] / attributes[key][0] * windowWidth;
                console.log(windowWidth, attr.height)
                break;
              }
              default: {
                break;
              }
            }
          }
        }
        this.setData({
          _data: JSON.parse(val.data),
          attributes: val.attributes && JSON.parse(val.attributes),
          ...attr
        });
      }
    }
  },
  data: {
    _data: [],
    source
  },
  lifetimes: {
    attached() {
      console.log("attached");
    }
  },
  methods: {
    myBehaviorMethod() {}
  }
});
