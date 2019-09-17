export const SPLIT = 4;
export const GUTTER = 10;

Component({
  properties: {
    data: {
      type: Object,
      value: {},
      observer: function(newVal) {
        if (newVal.id) {
          let { attributes, data, ...other } = newVal;
          attributes = attributes ? JSON.parse(attributes) : {};
          data = data ? JSON.parse(data) : [];
          const { userType } = wx.getStorageSync("user") || {};
          const { windowWidth } = wx.getSystemInfoSync();
          function checkAuthor(ut) {
            return ut === null || ut === undefined || ut === userType;
          }

          const split = attributes.split || SPLIT;
          attributes.itemWidth = Math.floor(
            (windowWidth - (split + 1) * 10) / split
          );
          if (checkAuthor(attributes.userType)) {
            if (data.length > 0) {
              data = data.filter(item => checkAuthor(item.userType));
              let row = 0;
              data.forEach((item, index) => {
                // 如果没有size属性, 默认为1
                item.size = item.size || 1;
                // 如果size大于单行分割份数, 强制将size设置为单行分割份数
                item.size = item.size > split ? split : item.size;
                // 检查当前行剩余空单元位数量
                const rowLast = split - (row % split);
                if (item.size > rowLast) {
                  // 如果当前元素宽度大于剩余单元位数量
                  // 方案1: 自动补齐单元位计数, 超量元素从下一行重新计数;
                  // row += rowLast; // 方案1
                  // 方案2: 将当前元素的size设置为剩余单元位数量;
                  item.size = rowLast; // 方案2
                }
                row += item.size;
                if (row % split === 0) {
                  item.isRowEnd = true;
                }
              });
            }
          }
          data.forEach(val => {
            const split = val.split || SPLIT;
            val.itemWidth = Math.floor(
              (windowWidth - (split + 1) * 10) / split
            );
          });
          this.setData({
            _data: data,
            attributes,
            ...other
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
