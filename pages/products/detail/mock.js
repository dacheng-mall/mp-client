exports.product = {
  title:
    "这是个很长的商品名称这是个很长的商品名称这是个很长的商品名称这是个很长的商品名称",
  video: {
    url: "http://www.w3school.com.cn/example/html5/mov_bbb.mp4",
    poster: "http://www.w3school.com.cn/i/eg_mouse.jpg"
  },
  images: [
    {
      type: "image",
      url: "http://www.w3school.com.cn/i/eg_mouse.jpg",
      name: "图1"
    },
    {
      type: "image",
      url: "http://www.w3school.com.cn/i/eg_mouse.jpg",
      name: "图2"
    },
    {
      type: "image",
      url: "http://www.w3school.com.cn/i/eg_mouse.jpg",
      name: "图3"
    }
  ],
  price: 1000,
  stockUp: [10, 30],
  attributes: [
    "含票",
    "送货上门",
    "加印logo",
    "破损包赔",
    "定制杯盖",
    "任何奇葩需求"
  ],
  content: [
    {
      type: "text",
      align: "center",
      size: 30,
      padding: 10,
      italic: true,
      weight: "bold",
      value:
        "文字内容文字内容文字内容文字内容文字内容文字内容文字内容文字内容文字内容文字内容文字内容文字内容"
    },
    {
      type: "image",
      value:
        "http://5b0988e595225.cdn.sohucs.com/images/20180827/d236d38d089b44e4b633536853137cf6.jpeg"
    },
    {
      type: "image",
      value:
        "http://5b0988e595225.cdn.sohucs.com/images/20180827/21d257b77a634a24be537cb93ad5d5b6.gif"
    },
    {
      type: "image",
      value:
        "http://5b0988e595225.cdn.sohucs.com/images/20180827/21d257b77a634a24be537cb93ad5d5b6.gif"
    }
  ],
  favorite: true
};
exports.products = [];
