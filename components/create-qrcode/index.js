// import QRCode from 'qrcode';
// const QRcode = require('qrcode')
import { api } from "../../utils/qrcode";

const DEF_SCENE = JSON.stringify({
  type: null
});

Component({
  properties: {
    scene: {
      type: String,
      value: DEF_SCENE
    },
    showSaveBtn: {
      type: Boolean,
      value: true
    },
    logo: {
      type: String,
      value: ''
    }
  },
  data: {
    size: 200,
    preview: ""
  },
  lifetimes: {
    attached: function() {
      setTimeout(() => {
        this.create();
      }, 2000);
    }
  },
  methods: {
    save: function(size) {
      return new Promise((res, rej) => {
        const that = this;
        wx.canvasToTempFilePath(
          {
            x: 0,
            y: 0,
            width: size,
            height: size,
            canvasId: "qrcode",
            success: function(url) {
              res(url.tempFilePath);
              setTimeout(() => {
                that.setData({
                  preview: url.tempFilePath
                });
              }, 500);
            },
            fail(e) {
              rej(e);
            }
          },
          that
        );
      });
    },
    preview: function() {
      const { preview: url } = this.data;
      if (url) {
        wx.previewImage({
          urls: [url]
        });
      }
    },
    saveToAlbum: function() {
      const { preview: filePath } = this.data;
      if (filePath) {
        wx.saveImageToPhotosAlbum({
          filePath
        });
      }
    },

    create: function() {
      const { windowWidth } = wx.getSystemInfoSync();
      console.log(wx.getSystemInfoSync())
      this.setData({
        size: windowWidth
      });
      const ct = Math.floor((new Date().valueOf()) / 1000)
      api.draw({
        str: `${this.data.scene}&ct=${ct}`,
        canvas: "qrcode",
        size: windowWidth,
        context: this,
        ecc: 3,
        logo: this.data.logo,
        callback: () => {
          setTimeout(() => {
            this.save(windowWidth);
          }, 200);
        }
      });
    }
  }
});
