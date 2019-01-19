const { source, pathPrefix } = require("../../setting");
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
                attr.swiperHeight = attributes[key][1] / attributes[key][0] * windowWidth;
                break;
              }
              default: {
                break;
              }
            }
          }
        }
        // 如果swiper类型的元素没有属性值,默认比例是1:1
        if(val.type === 'swiper' && !attr.swiperHeight) {
          const { windowWidth } = wx.getSystemInfoSync();
          attr.swiperHeight = windowWidth
        }
        let data = JSON.parse(val.data).map((d, i) => {
          const {pageId, productId, mainImage} = d;
          const res = {};
          res.image = `${source}${mainImage}`;
          res.name = d.displayName || d.name
          switch(true) {
            case !!pageId: {
              res.id = pageId;
              res.type = 'page';
              res.path = `${pathPrefix.page}?id=${pageId}`
              break;
            }
            case !!productId: {
              const {isSelf} = d
              res.id = productId;
              res.type = 'product';
              res.path = `${pathPrefix.product}?id=${productId}`
              res.price = d.price;
              res.isSelf = isSelf
              break;
            }
          }
          switch(val.type) {
            case 'list': {
              res.size = d.size;
              break;
            }
            case 'swiper': {
              break;
            }
            default: {
              break;
            }
          }
          return res;
        });
        this.setData({
          _data: data,
          id: val.id,
          attributes: val.attributes && JSON.parse(val.attributes),
          ...attr
        });
      }
    },
    index: {
      type: Number,
    }
  },
  data: {
    _data: [],
    source
  },
  methods: {
    myBehaviorMethod() {},
  }
});
