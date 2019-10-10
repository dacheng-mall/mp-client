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
      this.setData({
        size: windowWidth
      });
      api.draw({
        str: this.data.scene,
        canvas: "qrcode",
        size: windowWidth,
        context: this,
        ecc: 2,
        callback: () => {
          setTimeout(() => {
            // await this.save();
            this.save(windowWidth);
          }, 200);
        }
      });
    }
  }
});
