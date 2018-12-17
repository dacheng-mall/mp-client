import { setFavorites } from "../../../utils/tools";
import { mockFetch } from "../../../utils/util";
import { data } from "./mock";

Page({
  onLoad(opt) {
    // 假设5秒后加载完数据,这里是初始化
    mockFetch(data, 300).then(res => {
      this.setData({
        ...res
      });
    });
  },
  onShow() {

  },
  clickProd(e) {
    wx.navigateTo({
      url: `/pages/products/detail/index?ids=${e.detail.id}`
    });
  },
  dbClickProd(e) {
    mockFetch(e.detail.id, 500).then(id => {
      setFavorites(id);
    });
  }
});
