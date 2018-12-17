import { products, categories, mainSwiper } from "./mock";
import { mockFetch } from "../../utils/util";
import { setFavorites, getFavorites } from "../../utils/tools";

Page({
  data: {
    products: {}
  },
  onLoad() {
    mockFetch({
      products,
      mainSwiper,
      categories
    }).then(res => {
      try {
        this.setData({ ...res });
      } catch (e) {}
    });
  },
  onShow() {
    this.setData({
      products: this.data.products
    });
    getFavorites().then(data => {
      this.setData({
        count: data.length
      });
    });
  },
  submitHandle: e => {
    console.log("home onSubmit: ", e.detail.value);
  },
  jump(e) {
    const path = e.currentTarget.dataset.path;
    wx.navigateTo({
      url: path
    });
  },
  clickProd(e) {
    wx.navigateTo({
      url: `/pages/products/detail/index?id=${e.detail.id}`
    });
  },
  dbClickProd(e) {
    // todo 这里可以调用收藏和取消收藏的api,然后根据请求结果再显示信息
    // 调用接口花费500ms
    mockFetch(e.detail.id, 500).then(id => {
      return setFavorites(id)
    }).then(data => {
      this.setData({
        count: data.length
      });
    });
  },
  favoEntry(e){
    wx.navigateTo({
      url: `/pages/products/group/index?favorites=yes`
    })
  }
});
