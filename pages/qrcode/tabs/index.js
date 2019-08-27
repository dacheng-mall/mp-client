Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  properties: {
    keys: {
      type: Array,
      value: [],
      observer: function(val) {
        const freeCount = val.filter(({ disabled }) => !disabled).length;
        this.setData({
          keys: val,
          freeCount
        });
      }
    },
    isIPX: {
      type: Boolean,
    },
    currentKey: {
      type: String,
      value: "",
      observer: function(val) {
        this.setData({
          currentKey: val
        });
      }
    },
    selectedColor: {
      type: String,
      value: "#00bcbd"
    },
    color: {
      type: String,
      value: "#666"
    }
  },
  methods: {
    change(e) {
      this.setData({
        currentKey: e.currentTarget.dataset.key
      });
      this.triggerEvent("onChange", e.currentTarget.dataset.key);
    }

    // goDetail(e) {
    //   this.triggerEvent("titleTap", e.currentTarget.dataset);
    // }
  }
});
