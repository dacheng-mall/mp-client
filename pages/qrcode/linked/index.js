import { source } from "../../../setting";

Component({
  properties: {
    institution: null,
    canBindSalesman: null,
    canBindUser: null,
    salesman: {
      type: null,
      value: null,
      observer: function(val){
        const {id} = wx.getStorageSync('user');
        if(val.id === id){
          this.setData({
            isMine: true
          })
        }
      }
    },
    activity: null,
    product: null,
    custom: null
  },
  data: {
    hasCont: false,
    source
  },
  lifetimes: {
    ready() {
      let hasCont = false;
      for (let a in this.properties) {
        if (this.properties[a]) {
          hasCont = true;
          this.setData({
            hasCont
          });
          break;
        }
      }
    }
  },
  methods: {
    goDetail: function(e) {
      const { id, type } = e.currentTarget.dataset;
      switch(type){
        case 'product':{
          wx.navigateTo({
            url: `/pages/products/detail/index?id=${id}`
          })
          break;
        }
        case 'activity':{
          wx.navigateTo({
            url: `/pages/activity/detail?id=${id}`
          })
          break;
        }
      }
    },
    makePhoneCall: function(e){
      const { phone } = e.currentTarget.dataset;
      if(phone) {
        wx.makePhoneCall({
          phoneNumber: phone
        });
      }
    },
    bindUser: function(){
      this.triggerEvent('bindEvent', 'user')
    },
    bindSalesman: function(){
      this.triggerEvent('bindEvent', 'salesman')
    },
    unbindSalesman: function(){
      this.triggerEvent('bindEvent', 'salesmanClear')
    },
  }
});
