Component({
  properties: {
    data: {
      type: Array,
      value: [
        {
          text: "颜值爆表",
          status: false
        },
        {
          text: "和蔼可亲",
          status: false
        },
        {
          text: "能说会道",
          status: false
        },
        {
          text: "贴心暖胃",
          status: false
        },
        {
          text: "值得信赖",
          status: false
        },
        {
          text: "慷慨大方",
          status: false
        },
        {
          text: "契而不舍",
          status: false
        },
        {
          text: "不可抗拒",
          status: false
        }
      ]
    },
    color: {
      type: String,
      value: "#ccc"
    },
    selectedColor: {
      type: String,
      value: "#00bcbd"
    }
  },
  methods: {
    onchange: function(e) {
      const index = e.currentTarget.dataset.index;
      const { data } = this.data;
      data[index].status = !data[index].status;
      this.setData(
        {
          data: [...data]
        },
        function() {
          this.triggerEvent("onChange", data);
        }
      );
    }
  }
});
