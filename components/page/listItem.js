Component({
  relations: {
    "./list": {
      type: "parent"
    }
  },
  properties: {
    data: {
      type: Object,
    },
    styles: {
      type: Object,
      value: {}
    },
    size: Number
  },
  lifetimes: {
    attached() {
    },
  },
  methods: {
    doubleTap(e) {
      const now = e.timeStamp;
      const {id, path, type} = this.data.data;
      if (!this.timeStamp) {
        // 第一次点击
        this.timeStamp = now;
        this.firstTap = setTimeout(() => {
          this.triggerEvent("click", { id, path, type});
          this.clearFirstTap();
        }, 350);
      } else if (this.timeStamp && now - this.timeStamp < 300) {
        // 300ms内的第二次点击视为双击, 并取消之前单击事件的回调;
        if(type !== 'product') {
          return;
        }
        this.clearFirstTap();
        this.triggerEvent("dbClick", { id, path, type });
        this.setData({
          'data.favorite': !this.properties.data.favorite
        });
      }
    },
    clearFirstTap() {
      if (this.timeStamp) {
        this.timeStamp = null;
        clearTimeout(this.firstTap);
        this.firstTap = null;
      }
    }
  }
});
