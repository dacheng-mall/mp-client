Component({
  properties: {
    data: {
      type: Object,
      value: {}
    },
    userType: {
      type: Number
    },
    isFirst: {
      type: Boolean
    }
  },
  relations: {
    "./index": {
      type: "parent"
    }
  },
  methods: {
    jump: function() {
      if (this.properties.data.path) {
        wx.navigateTo({
          url: this.properties.data.path
        });
      }
    }
  }
});
