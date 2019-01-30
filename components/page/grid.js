import regeneratorRuntime from "../../utils/regenerator-runtime/runtime";

const common = require("./common");
Component({
  behaviors: [common],
  lifetimes: {
    attached() {},
    ready() {}
  },
  methods: {
    init: function({cols, rows, data, index}) {
      const { windowWidth } = wx.getSystemInfoSync();
      const size = 1 / cols;
      const imgSize = "40%";
      if (data.length >= cols * rows) {
        data = data.slice(0, cols * rows);
      } else {
      }
      const init = [];
      const FILL = i => ({
        id: `grid_${index}_${i}`,
        name: "敬请期待",
        path: null
      });
      while (init.length < cols * rows) {
        const i = init.length;
        if (data[i]) {
          init.push(data[i]);
        } else {
          init.push(FILL(i));
        }
      }
      return {
        _data: init,
        width: `${size * 100}%`,
        height: `${(windowWidth - 20) * size}px`,
        imgSize
      }
    },
    click: function(e) {
      this.triggerEvent("click", e.currentTarget.dataset);
    }
  }
});
