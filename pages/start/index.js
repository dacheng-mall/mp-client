// pages/start/index.js
Page({
  data: {},
  onLoad(options) {
    console.log(options)
    // mockFetch({
    //   products,
    //   mainSwiper,
    //   categories
    // }).then(res => {
    //   try {
    //     this.setData({ ...res });
    //   } catch (e) {}
    // });
  },
  jump(e) {
    const { type } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/setInformation/index?type=${type}`
    });
  }
});
