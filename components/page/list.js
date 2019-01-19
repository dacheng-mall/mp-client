const common = require("./common");
Component({
  behaviors: [common],
  data: {
    styles: {}
  },
  lifetimes: {
    ready(){
      const query = wx.createSelectorQuery().in(this)
      query.select('#list-wrap').boundingClientRect((res) =>  {
        const {width} =res;
        const styles = {};
        styles.width_2x = width - 20;
        styles.width_1x = (width - 30) / 2;
        styles.height = styles.width_1x * 1.5;
        styles.height_txt = styles.width_1x / 2.2;
        this.setData({
          styles
        })
      }).exec()
    }
  },
  methods: {
    click(e) {
      this.triggerEvent("click", e.detail);
    },
    dbClick(e) {
      this.triggerEvent("dbClick", e.detail);
    },
    // mixinFavo(data, favorites) {
    //   return data.map(d => {
    //     if (favorites.includes(d.id)) {
    //       return { ...d, favorite: true };
    //     }
    //     return d;
    //   });
    // }
  }
});
