import { source } from "../../../../setting";
Component({
  properties: {
    ids: {
      type: Array,
      observer: function(newVal) {
        this.setData({
          checked: newVal.includes(this.properties.data.id)
        });
      },
      value: []
    },
    data: {
      type: Object
    }
  },
  data: {
    checked: false,
    source
  },
  methods: {
    tap(e) {
      this.triggerEvent("itemTap", e.currentTarget.dataset);
    },
    goDetail(e) {
      this.triggerEvent("titleTap", e.currentTarget.dataset);
    }
  }
});
