import {
  getFavorites,
  setFavorites,
  getStorageWithKey
} from "../../utils/tools";
import { post } from "../../utils/request";
import regeneratorRuntime from "../../utils/regenerator-runtime/runtime";

const common = require("./common");

Component({
  behaviors: [common],
  data: {
    styles: {},
    _data: []
  },
  lifetimes: {
    attached() {
      // getFavorites();
    },
    ready() {
      const query = wx.createSelectorQuery().in(this);
      query
        .select("#list-wrap")
        .boundingClientRect(res => {
          const { width } = res;
          const styles = {};
          styles.width_2x = width - 20;
          styles.width_1x = (width - 30) / 2;
          styles.height = styles.width_1x * 1.45;
          styles.height_txt = styles.width_1x * 0.4;
          this.setData({
            styles
          });
        })
        .exec();
    }
  },
  pageLifetimes: {
    async show() {
      const favo = wx.getStorageSync('favorites') || [];
      const { _data } = this.data;
      _data.data.forEach(d => {
        if (favo.includes(d.id)) {
          d.favorite = true;
        } else {
          d.favorite = false;
        }
      });
      this.setData({
        "_data.data": [..._data.data]
      });
    }
  },
  methods: {
    click(e) {
      this.triggerEvent("click", e.detail);
      const { path } = e.detail;
      wx.navigateTo({
        url: path
      });
    },
    dbClick: async function(e) {
      this.triggerEvent("dbClick", e.detail);
      const { type, id } = e.detail;
      if (type === "product") {
        const { id: userId } = await getStorageWithKey("user");
        const res = await post("api/sys/favorites/set", {
          userId,
          ids: [id]
        });
        const title = res.type === "remove" ? "移出购物车" : "加入购物车";
        wx.showToast({
          title
        });
        this.setData({
          favorites: await setFavorites(res.ids)
        });
      }
    }
  }
});
