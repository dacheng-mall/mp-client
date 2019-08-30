export const SPLIT = 4
export const GUTTER = 10

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
            const split = val.split || SPLIT;
            val.itemWidth =
              Math.floor((windowWidth - (split + 1) * 10) / split);
            if (checkAuthor(val.userType)) {
              if (val.items.length > 0) {
                val.items = val.items.filter(item =>
                  checkAuthor(item.userType)
                );
                let row = 0
                val.items.forEach((item, index) => {
                  // 如果没有size属性, 默认为1
                  item.size = item.size || 1;
                  // 如果size大于单行分割份数, 强制将size设置为单行分割份数
                  item.size = item.size > split ? split : item.size;
                  // 检查当前行剩余空单元位数量
                  const rowLast = split - row % split;
                  if(item.size > rowLast) {
                    // 如果当前元素宽度大于剩余单元位数量
                    // 方案1: 自动补齐单元位计数, 超量元素从下一行重新计数;
                    // row += rowLast; // 方案1
                    // 方案2: 将当前元素的size设置为剩余单元位数量;
                    item.size = rowLast; // 方案2
                  }
                  row += item.size;
                  if(row % split === 0) {
                    item.isRowEnd = true
                  }
                })
              }
              res.push(val);
            }
          });
          this.setData({
            items: res
          });
        }
      }
    },
    gutter: {
      type: Number,
      value: GUTTER
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
