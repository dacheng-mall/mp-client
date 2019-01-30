const { source, pathPrefix } = require("../../setting");
import { getFavorites } from "../../utils/tools";
import regeneratorRuntime from "../../utils/regenerator-runtime/runtime";

module.exports = Behavior({
  behaviors: [],
  properties: {
    data: {
      type: Object,
      observer: async function(val) {
        const attributes = val.attributes && JSON.parse(val.attributes);
        let favorites = [];
        if (val.type === "list") {
          favorites = await getFavorites();
        }
        const attr = {};
        if (attributes) {
          for (let key in attributes) {
            switch (key) {
              case "rate": {
                const { windowWidth } = wx.getSystemInfoSync();
                attr.swiperHeight =
                  (attributes[key][1] / attributes[key][0]) * windowWidth;
                break;
              }
              case "cols":
              case "rows":
                attr[key] = attributes[key];
                break;
              default: {
                break;
              }
            }
          }
        }
        // 如果swiper类型的元素没有属性值,默认比例是1:1
        if (val.type === "swiper" && !attr.swiperHeight) {
          const { windowWidth } = wx.getSystemInfoSync();
          attr.swiperHeight = windowWidth;
        }
        let data = [];
        if (typeof val.data === "string") {
          data = JSON.parse(val.data).map((d, i) => {
            const {
              id,
              image,
              type,
              displayName,
              name,
              institutionId,
              price,
              size
            } = d;
            const res = {
              image: `${source}${image}`,
              name: displayName || name,
              id,
              type,
              path: `${pathPrefix[type]}?id=${id}`
            };
            switch (type) {
              case "product": {
                res.price = price;
                res.isSelf = !institutionId;
                if (favorites.indexOf(id) !== -1) {
                  res.favorite = true;
                }
                break;
              }
              case "category": {
                res.path = `${pathPrefix.category}?cateId=${id}`;
                break;
              }
            }
            switch (val.type) {
              case "list": {
                res.size = size;
                break;
              }
              default: {
                break;
              }
            }
            return res;
          });
        } else {
          // 这是list(商品列表页)在使用该组件
          val.data.map(d => {
            if (favorites.indexOf(d.id) !== -1) {
              d.favorite = true;
            }
          });
          data = val.data;
        }
        let newState = {};
        if (val.type === "grid") {
          newState = this.init({
            ...attr,
            index: val.index,
            data
          });
        }
        this.setData({
          _data: data,
          id: val.id || "only",
          attributes: (val.attributes && JSON.parse(val.attributes)) || {},
          favorites: favorites.length,
          ...attr,
          ...newState
        });
      }
    },
    index: {
      type: Number
    }
  },
  data: {
    _data: [],
    source
  },
  methods: {
    myBehaviorMethod() {}
  }
});
