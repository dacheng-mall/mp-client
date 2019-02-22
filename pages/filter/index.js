Page({
  data:{},
  onLoad(){
    wx.setNavigationBarTitle({
      title: '查询商品'
    })
  },
  formSubmit(e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
  },
  formReset() {
    console.log('form发生了reset事件')
  }
})