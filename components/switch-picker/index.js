Component({
  properties: {
    data: {
      type: Array,
      observer: function(val){
        const range = [];
        const cont = [];
        val.forEach(({label, content}) => {
          range.push(label);
          cont.push(content);
        })
        this.setData({
          range,
          cont
        })
      }
    }
  },
  data: {
    value: 0,
  },
  methods: {
    change: function(e){
      this.setData({
        value: e.detail.value
      })
    }
  }
})