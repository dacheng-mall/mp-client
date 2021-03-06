import { get, post } from "../../../utils/request";
import { getFavorites } from "../../../utils/tools";
import { uri } from "../../../utils/util";
import { source } from "../../../setting";
import regeneratorRuntime from "../../../utils/regenerator-runtime/runtime";

Page({
  data: {
    list: [],
    favorites: false,
    ids: []
  },
  onShow() {
    wx.hideShareMenu();
    const favorites = wx.getStorageSync("favorites");
    const { windowHeight } = wx.getSystemInfoSync();
    this.setData({
      height: windowHeight
    });
    if (this.data.list.length !== favorites.length) {
      this.fetch();
    } else {
      for (let fid of favorites) {
        if (!this.data.list.find(({ id }) => fid === id)) {
          this.fetch();
          break;
        }
      }
    }
    if (this.options.ids) {
      this.fetch();
      wx.hideTabBar({ animation: false });
    }
  },
  fetch: async function() {
    const opts = this.options;
    const { id } = wx.getStorageSync("user");
    const path = uri(this.route, opts);
    if (!opts.ids) {
      // 这是收藏页面, 请求个人搜藏的商品列表
      const data = await get("api/sys/favorites", { userId: id });
      this.setData({
        list: this.normalizeFavoData(data),
        favorites: true,
        path
      });
    } else {
      // 这是推荐商品组页面
      wx.hideTabBar();
      const autoIds = opts.ids.split(",");
      const query = (function(ids) {
        let res = "";
        ids.forEach((autoId, i) => {
          if (i === 0) {
            res += `?autoIds=${autoId}`;
          } else {
            res += `&autoIds=${autoId}`;
          }
        });
        return res;
      })(autoIds);
      const data = await get(`api/sys/product/autoIds${query}`);
      this.setData({
        list: data,
        favorites: false
      });
    }
  },
  normalizeFavoData(data = []) {
    const res = [];
    data.forEach(({ product }) => {
      if (product.id) {
        res.push(product);
      }
    });
    return res;
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
  onRemove: async function() {
    const user = wx.getStorageSync("user");
    if (!user) {
      return;
    }
    const { ids, list } = this.data;
    await post("api/sys/favorites/delete", { ids, userId: user.id });
    const newStore = await getFavorites();
    const newList = list.filter(d => !ids.includes(d.id));
    ids.forEach((d, i) => {
      const index = newStore.indexOf(d);
      if (index !== -1) {
        newStore.splice(index, 1);
      }
    });
    this.setData({
      list: newList,
      ids: []
    });
    wx.setStorageSync("favorites", newStore);
  },
  onShareAppMessage() {
    const length = this.data.ids.length;
    const first = this.data.ids[0];
    const target = this.data.list.filter(({ id }) => id === first)[0];
    const autoIds = [];
    this.data.list.forEach(({ id, autoId }) => {
      if (this.data.ids.includes(id)) {
        autoIds.push(autoId);
      }
    });
    const ids = autoIds.join(",");
    var shareObj = {
      title: `分享 ${target.title}${length === 1 ? "" : ` 等${length}件商品`}`,
      path: `/pages/products/group/index?favorites=no&ids=${ids}`,
      imageUrl: `${source}${target.mainImageUrl}`
    };
    return shareObj;
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
  },
  gohome() {
    wx.redirectTo({
      url: "/pages/home/index"
    });
  }
});
