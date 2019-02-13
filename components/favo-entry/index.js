import { getFavorites } from "../../utils/tools";
import regeneratorRuntime from "../../utils/regenerator-runtime/runtime";
Component({
  properties: {
    iconName: {
      type: String,
      value: "heart-fill"
    }
  },
  data: {
    count: 0
  },
  pageLifetimes: {
    async show() {
      this.updateCount();
    }
  },
  lifetimes: {
    created() {
      this.updateCount();
    }
  },
  methods: {
    async updateCount() {
      const favo = await getFavorites();
      this.setData({
        count: favo.length || 0
      });
    }
  }
});
