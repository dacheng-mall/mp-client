// const INITIAL_VALUE = new Array();

Component({
  properties: {
    value: {
      type: Number,
      value: 3,
    },
    total: {
      type: Number,
      value: 5
    },
    checkColor: {
      type: String,
      value: "#f00"
    },
    name: {
      type: String
    },
    color: {
      type: String,
      value: "#ccc"
    }
  },
  data: {
    stars: [],
    current: 0
  },
  lifetimes: {
    attached: function() {
      this.render(this.data.value);
    }
  },
  methods: {
    render: function(value) {
      const INITIAL_VALUE = new Array(this.data.total).fill(false);
      INITIAL_VALUE.forEach((v, i) => {
        if (i < value) {
          INITIAL_VALUE[i] = true;
        } else {
          INITIAL_VALUE[i] = false;
        }
      });
      this.setData({
        stars: INITIAL_VALUE,
        current: value
      });
    },
    change: function(e) {
      const index = e.currentTarget.dataset.index;
      if (
        index !== 0 &&
        index + 1 !== this.data.current
      ) {
        this.triggerEvent("onChange", index + 1);
        this.render(index + 1);
      } else if (index === 0) {
        this.triggerEvent("onChange", this.data.current !== 1 ? index + 1 : 0);
        this.render(this.data.current !== 1 ? index + 1 : 0);
      }
    }
  }
});
