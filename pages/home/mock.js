exports.products = [
  {
    id: "group00",
    title: "商品组名称",
    list: [
      {
        id: "p00",
        name: "商品1",
        type: "c00",
        price: 100,
        mainImage: "",
        size: 1
      },
      {
        id: "p01",
        name:
          "商品名称特别长商品名称特别长商品名称特别长商品名称特别长商品名称特别长商品名称特别长",
        type: "c00",
        price: 100,
        mainImage: "",
        size: 1
      },
      {
        id: "p02",
        name: "商品1",
        type: "c00",
        price: 100,
        mainImage: "",
        size: 2
      }
    ]
  },
  {
    id: "group01",
    title: "第二组商品",
    list: [
      {
        id: "p03",
        name: "商品名称",
        type: "c00",
        price: 100,
        mainImage: "",
        size: 1
      },
      {
        id: "p04",
        name: "商品1",
        type: "c00",
        price: 100,
        mainImage: "",
        size: 1
      },
      {
        id: "p05",
        name: "商品1",
        type: "c00",
        price: 100,
        mainImage: "",
        size: 1
      },
      {
        id: "p06",
        name: "商品1",
        type: "c00",
        price: 100,
        mainImage: "",
        size: 1
      }
    ]
  }
];
exports.categories = [
  {
    id: "c00",
    name: "小家电"
  },
  {
    id: "c01",
    name: "纺织物"
  },
  {
    id: "c02",
    name: "日用品"
  },
  {
    id: "c03",
    name: "虚拟"
  },
  {
    id: "c04",
    name: "数码"
  },
  {
    id: "c05",
    name: "饰品"
  }
];

exports.mainSwiper = [
  {
    id: "swiper00",
    imageUrl: "",
    name: "",
    path: "/pages/products/group/index?ids=p00,p01,p02"
  },
  {
    id: "swiper01",
    imageUrl: "",
    name: "",
    path: "/pages/products/list/index"
  }
];
