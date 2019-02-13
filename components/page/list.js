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
      getFavorites();
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
          styles.height = styles.width_1x * 1.4;
          styles.height_txt = styles.width_1x * 0.35;
          this.setData({
            styles
          });
        })
        .exec();
    }
  },
  pageLifetimes: {
    async show() {
      const favo = await getFavorites();
      const { _data } = this.data;
      _data.forEach(d => {
        if (favo.includes(d.id)) {
          d.favorite = true;
        } else {
          d.favorite = false;
        }
      });
      this.setData({
        _data: [..._data]
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
      let newFavo = [];
      if (type === "product") {
        const { id: userId } = await getStorageWithKey("user");
        const favo = await getFavorites();
        if (favo.indexOf(id) !== -1) {
          const res = await post("api/sys/favorites/delete", {
            userId,
            ids: [id]
          });
          if (typeof res === "object") {
            newFavo = await setFavorites([id]);
          }
        } else {
          const res = await post("api/sys/favorites", { userId, ids: [id] });
          if (typeof res === "object") {
            newFavo = await setFavorites([id]);
          }
        }
        this.setData({
          favorites: newFavo
        });
      }
    }
  }
});
