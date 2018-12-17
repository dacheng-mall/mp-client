# 小程序前端 api

- mp 前缀表示小程序使用,v\d 表示 api 版本;

```
  \$pf = mp/v1
```

- 返回值格式;

```
  {
    msg: String,      // 状态信息
    status: Number,   // 业务处理状态
    data: Object,     // 返回数据
  }
```

### 用户登录/首次登录为注册并登录

```
post $pf/login
body: {
  openId: String
}

response.data: {
  token: String,
  avatar: String,
  nickname: String,
  mobile: String,
  id: String,
  roles: String,
  institutionName: String,
  institutionId: String,
  idcard: String,
  workCode: String,
  openId: String
}
```

### 获取用户当前收藏商品id列表

```
get $pf/favorites
// 返回收藏商品的id列表
response.data: String[]
```

### 获取首页商品组

```
get $pf/home

response.data: {
  swiper: [               // 首页滚动图组
    {
      id: String,
      imageUrl: String,   // 图片url
      name: String,       // 名称
      path: String        // 跳转路径
    }, ...
  ],
  categories: [           // 商品分类列表
    {
      id: String,         // 分类id
      name: String        // 分类名称
    }, ...
  ],
  products: [             // 多个商品组集合
    {
      id: String,     // 商品组的id
      title: String,  // 商品组的名称
      list: [         // 商品组中包含的商品列表
        {
          id: String,         // 商品id
          name: String,       // 商品名称
          price: Number,      // 商品单价,单位元
          mainImage: String,  // 商品主图url
          size: Enum(1,2)     // 商品元素尺寸, 1小, 2大
        }, ...
      ]
    }, ...
  ]

}
```

### 商品收藏状态变更

```
// 收藏商品
put $pf/favo
// 取消收藏商品
put $pf/favoless

body: {
  ids: String // productId-0,productId-1,...,productId-N
}

// 取消收藏时会有批量操作, 收藏时暂无批量操作

response.data: ids
```

### 获取商品列表

根据多维度查询商品, ids(若干商品 id,逗号隔开), 分类 categoryId, 名称关键;  
包含分页 page, pagesize

```
get $pf/products?keywords=xxx&ids=xxx&cid=xxx
response: {
  data: {
    pagination: {
      page: Number,       // 当前页数
      pageSize: Number,   // 单页数量
      totle: Number       // 总数
    },
    list: [
      {
        id: String,           // 商品id
        name: String,         // 商品名称
        // type: String,      // 商品所属分类id, 可以不返回
        // typeName: String,  // 商品分类名称名称, 可以不返回
        price: Number,        // 单价
        mainImage: String     // 主图url
        factory: String,      // 厂商名称
        factoryType: String,  // 厂商类型Enum 'self' | 'third' 作为基础数据维护
      },
  }
}
```

### 获取收藏商品列表
```
get $pf/favoProducts
// 返回值结构同上, 不要分页, 返回全部
```
### 获取商品详情
```
get $pf/detail/:id
response.data: {
  title: String,          // 商品名称
  video: {                // 视频
    url: String,          // 视频资源地址
    poster: String        // 视频封面图片资源地址
  },
  images: [
    {
      url: String,        // 图片资源地址
      name: String        // 图片名称
    },
    ...
  ],
  price: Number,           // 单价, 单位元
  factory: String,         // 厂商名称
  factoryType: String,     // 厂商类型
  stockUp: [               // 备货周期, 若干量对应若干天数
    {
      count: Number,       // 数量
      days: Number,        // 天数
    }
  ],
  attributes: String[],     // 商品数据, 字符串数组,
  content: [                // 图文混排的商品描述
    {
      type: String,         // 内容类型Enum, text | image | list
      ...
    },
    {                      // type === 'text' 示例
      type: 'text',
      align: String,       // 水平方向对齐方式, ''center'
      size: Number,         // 字体尺寸, 30
      padding: Number,      // 周围填充尺寸
      italic: Boolean,      // 是否斜体
      weight: Number | String, // 字宽值, 可是是数字或字符串,
      value: String,        // 显示的文字值
    },
    {
      type: 'image',
      value: String,        // 如果是图片只有value一项值,图片的资源地址
    },
    {
      type: 'list',
      value: [               // 列表类型的内容是数组类型的数据
        {
          label: String,      // 单行的标题
          cont: String,       // 单行的内容
        },
        ...
      ]
    }
  ]
}
```

