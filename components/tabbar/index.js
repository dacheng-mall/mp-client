Component({
  data: {
    list: [
      {
        path: '',
        icon: '',
        iconSelected: '',
        color: '',
        colorSelected: '',
        text: '有礼'
      }
    ]
  },
  lifetimes: {
    attached() {
    }
  },
  methods: {
    change: function(e){
      this.setData({
        value: e.detail.value
      })
    }
  }
})