import regeneratorRuntime from "../../utils/regenerator-runtime/runtime";
Page({
  data: {},
  onShow() {
    this.fetch(this.options.scene);
    console.log(this)
  },
  fetch: async function(scene) {
    wx.showLoading()
    const mock = {
      init: {
        id: "1",
        autoId: 1,
        batchId: "11",
        type: {
          id: "12",
          name: "挪车码",
          fields: JSON.stringify([
            {
              code: "license_plate_numbe",
              name: "车牌号",
              type: 'lpNumber'
            },
            {
              code: 'mobile',
              name: '手机号',
              type: 'mobile'
            }
          ]),
          template: ''
        },
        mainImageUrl: 'http://res.idacheng.cn/20190211162547_93__%E8%BD%AE%E6%92%AD%E5%9B%BE.jpg',
        userId: '',
        salesmanId: '',
        fields: '',
        salesmanBindTime: '',
        userBindTime: '',
        url: '',
        status: 1
      },
      bindSalesman: {
        id: "1",
        autoId: 1,
        batchId: "11",
        type: {
          id: "12",
          name: "挪车码",
          fields: JSON.stringify([
            {
              code: "license_plate_numbe",
              name: "车牌号",
              type: 'lpNumber'
            },
            {
              code: 'mobile',
              name: '手机号',
              type: 'mobile'
            }
          ]),
          template: ''
        },
        userId: '',
        salesmanId: '',
        fields: '',
        salesmanBindTime: '',
        userBindTime: '',
        url: '',
        status: 1
      },
    };
    setTimeout(() => {
      wx.hideLoading()
      this.setData({
        data: mock[scene]
      })
    },1000)
  },
  bindSalesman: async function() {},
  editFields: async function() {}
});
