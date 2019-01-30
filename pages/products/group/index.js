import { data } from "./mock";
import { get } from "../../../utils/request";
import regeneratorRuntime from "../../../utils/regenerator-runtime/runtime";

Page({
  data: {
    list: [],
    favorites: false,
    ids: []
  },
  onLoad(opts) {
    const { windowHeight } = wx.getSystemInfoSync();
    const { id } = wx.getStorageSync("user");
    this.fetch(id)
    if (opts.favorites === "yes") {
      // 这是收藏页面
      this.fetch().then(res => {
        this.setData({
          ...res,
          favorites: true,
          windowHeight
        });
      });
    } else {
      // 这是推荐商品组页面
      const ids = opts.ids;
      // this.fetch(ids).then(res => {
      //   this.setData({
      //     ...res,
      //     favorites: false,
      //     windowHeight
      //   });
      // });
    }
  },
  fetch: async function(userId) {
    const data = await get("api/sys/favorites", { userId });
    if(data && data.lenght > 0){
      console.log(data)
    }
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(data);
      }, 300);
    });
  },
  chooseAll(e) {
    if (!this.data.chooseState) {
      this.setData({
        chooseState: true,
        ids: this.getListIds()
      });
    } else {
      this.setData({
        chooseState: false,
        ids: []
      });
    }
  },
  checkChange(e) {
    const ids = e.detail.value;
    this.setData({
      ids,
      chooseState: ids.length === this.data.list.length
    });
  },
  onRemove() {
    // TODO 对接api
    const ids = this.data.ids;
    console.log("取消收藏以下商品", ids.join(","));
  },
  onShare() {
    // TODO 对接api
    const ids = this.data.ids;
    console.log("分享以下商品", ids.join(","));
  },
  itemTap(e) {
    const { id } = e.detail;
    // 处于选择模式,编辑或者分享
    const index = this.data.ids.indexOf(id);
    const { ids } = this.data;
    if (index !== -1) {
      ids.splice(index, 1);
    } else {
      ids.push(id);
    }
    this.setData({
      ids,
      chooseState: ids.length === this.data.list.length
    });
  },
  titleTap(e) {
    const ids = this.getListIds();
    wx.navigateTo({
      url: `/pages/products/detail/index?ids=${ids.join(",")}&id=${e.detail.id}`
    });
  },
  getListIds() {
    return this.data.list.map(({ id }) => id);
  }
});
