import { decodeQrcodeQuery, scanQrcode } from "../../../utils/util";
Page({
  data: {},
  onShow: function() {
    console.log('0000', this.options.q)
    // const opt = decodeQrcodeQuery(
    //   `${this.options.q}&st=${this.options.scancode_time * 1000}`
    // );
    // switch(opt.url) {
    //   case 'https://mp.liquanyou.cn' : {
    //     const {autoId, ct, st} = opt.query
    //     wx.redirectTo({
    //       url: `/pages/personal/selfShow/index?said=${autoId}&createTime=${ct}&scancodeTime=${st}`
    //     })
    //     break;
    //   }
    // }
    scanQrcode(this.options.q)
  }
});
