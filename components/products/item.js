const app = getApp();

Component({
  relations: {
    "./index": {
      type: "parent"
    }
  },
  properties: {
    data: {
      type: Object,
      value: {}
    },
    style: {
      type: Object,
      value: {}
    }
  },
  methods: {
    doubleTap(e) {
      const now = e.timeStamp;
      if (!this.timeStamp) {
        // 第一次点击
        this.timeStamp = now;
        this.firstTap = setTimeout(() => {
          this.triggerEvent("click", { id: e.currentTarget.dataset.id });
          this.clearFirstTap();
        }, 350);
      } else if (this.timeStamp && now - this.timeStamp < 300) {
        // 300ms内的第二次点击视为双击, 并取消之前单击事件的回调
        this.clearFirstTap();
        this.triggerEvent("dbClick", { id: e.currentTarget.dataset.id });
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
