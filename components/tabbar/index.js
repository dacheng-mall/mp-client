Component({
  properties: {
    path: {
      type: String,
      observer: function(val) {
        const path = `/${val}`;
        this.data.list.forEach((item, i) => {
          if (item.path === path) {
            this.setData({
              actived: i
            });
          }
        });
      }
    }
  },
  data: {
    actived: null,
    list: [
      {
        path: "/pages/customPage/index?code=home",
        icon: "gift",
        iconSelected: "gift-fill",
        color: "#333",
        colorSelected: "#00bcbd",
        text: "有礼"
      },
      {
        path: "/pages/products/group/index?favorites=yes",
        icon: "cart",
        iconSelected: "cart-fill",
        color: "#333",
        colorSelected: "#00bcbd",
        text: "购物车"
      }
    ]
  },
  methods: {
    change: function(e) {
      const {
        currentTarget: {
          dataset: { path }
        }
      } = e;
      wx.redirectTo({
        url: `${path}`
      })
    }
  }
});
