import { process } from "./products-tools";
Component({
  relations: {
    "./item": {
      type: "child"
    }
  },
  properties: {
    data: {
      type: Array,
      value: [],
      observer: function(newVal) {
        // 只要prop.data发生变更就做一次集中处理
        process(newVal).then(data => {
          this.setData({
            _data: data
          })
        });
      }
    },
    title: {
      type: String,
      value: ""
    }
  },
  data: {
    _data: {}
  },
  methods: {
    click(e) {
      this.triggerEvent("click", e.detail);
    },
    dbClick(e) {
      this.triggerEvent("dbClick", e.detail);
    },
    mixinFavo(data, favorites) {
      return data.map(d => {
        if (favorites.includes(d.id)) {
          return { ...d, favorite: true };
        }
        return d;
      });
    }
  }
});
