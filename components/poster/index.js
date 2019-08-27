import { post, get } from "../../utils/request";
import { sourceSSL } from "../../setting";
import regeneratorRuntime from "../../utils/regenerator-runtime/runtime";
import { base64src } from "./base64src";

Component({
  properties: {
    btnText: {
      type: String,
      value: "生成海报"
    },
    styles: {
      type: String,
      value: ""
    },
    className: {
      type: String,
      value: ""
    },
    page: {
      type: String,
      value: ""
    },
    bg: {
      type: String,
      value: "",
      observer: function(val, old) {
        if (!old) {
          this.getImageUrl(val).then(url => {
            wx.getImageInfo({
              src: url,
              success: res => {
                wx.getSystemInfo({
                  success: sys => {
                    this.setData({
                      ww: sys.windowWidth,
                      wh: sys.windowWidth * (res.height / res.width),
                      _wh: sys.windowHeight,
                      bg: url
                    });
                  }
                });
              },
              fail: function(err) {
                console.log("--------", err, val);
              }
            });
          });
        }
      }
    },
    scene: {
      type: String,
      value: ""
    },
    width: {
      type: Number,
      value: 280
    },
    title: {
      type: String,
      value: ""
    }
  },
  // 0: 未开始注册; 1: 制作中; 2: 制作完成; 3: 制作失败
  data: {
    step: 0,
    preview: ""
  },
  methods: {
    drawImg: async function(ctx, url, left, top, width, height, isCircle) {
      ctx.save();
      if (isCircle) {
        ctx.beginPath();
        ctx.arc(
          width / 2 + left,
          height / 2 + top,
          width / 2,
          0,
          Math.PI * 2,
          false
        );
        ctx.clip();
      }
      return new Promise((resolve, reject) => {
        wx.getImageInfo({
          src: url,
          success: res => {
            ctx.drawImage(res.path, left, top, width, height);
            ctx.restore();
            resolve();
          },
          fail: e => {
            reject(e);
          }
        });
      });
    },
    getImageUrl: async function(url, prefix = "https://") {
      let _url = await get(`v1/api/public/saveImg?url=${url}`);
      _url = _url.replace(/\\/g, "/");
      return `${sourceSSL}${_url}`;
    },
    getQr: async function() {
      try {
        const data = await post("v1/api/wx/createWXAQRCode", {
          page: this.properties.page,
          scene: this.properties.scene,
          width: this.properties.width
        });
        if (data.length < 20000) {
          wx.showToast({
            title: "定制海报失败, 请重试"
          });
          return false;
        }
        return `data:image/jpg;base64,${data}`;
      } catch (e) {}
    },
    drawQr: async function(ctx, qr, { x, y, w, h, bgc }) {
      ctx.fillStyle = bgc;
      ctx.fillRect(x, y, w, h);
      await this.drawImg(ctx, qr, x + 5, y + 5, w - 10, h - 10);
    },
    drawLine: function(ctx) {
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(160, this.data.wh - 115);
      ctx.lineTo(160, this.data.wh - 45);
      ctx.stroke();
    },
    getContent(detail, length = 21, row = 2) {
      let len = 0;
      let index = 0;
      let content = [];
      let lastLineLength = 0;
      for (let i = 0; i < detail.length; i++) {
        // 若未定义则致为 ''
        if (!content[index]) {
          content[index] = "";
        }
        content[index] += detail[i];
        // 中文或者数字占两个长度
        if (
          detail.charCodeAt(i) > 127 ||
          (detail.charCodeAt(i) >= 48 && detail.charCodeAt(i) <= 57)
        ) {
          len += 2;
        } else {
          len++;
        }
        if (len >= length || (row - index === 1 && len >= length - 2)) {
          lastLineLength = len;
          len = 0;
          index++;
        }
        if (index === row) {
          if (lastLineLength >= length || lastLineLength >= length - 2) {
            content[index - 1] = content[index - 1].replace(/.$/, "...");
          }
          break;
        }
      }
      return content;
    },

    text: function(ctx, title) {
      const { ww, wh } = this.data;
      const fontSize = 20;
      const singleLineMax = Math.floor((ww - 170) / (fontSize / 2));
      const t = this.getContent(title, singleLineMax);
      ctx.setFontSize(fontSize);
      ctx.setTextAlign("left");
      ctx.fillStyle = "#fff";
      ctx.setTextBaseline("top");
      let textHeight = 0;
      t.map((_t, i) => {
        ctx.fillText(_t, 170, wh - 115 + i * 22, ww - 182);
        textHeight += 24;
      });
      ctx.setFontSize(16);
      ctx.fillStyle = "#eee";
      ctx.fillText("长按图片进入活动", 170, wh - 115 + textHeight, ww - 182);
    },
    drawAvarta: async function(ctx, name, instName) {
      ctx.setFontSize(20);
      ctx.setTextAlign("left");
      ctx.fillStyle = "#fff";
      ctx.fillText(name, this.data.ww - 84 - name.length * 20, 40);
      ctx.setFontSize(16);
      ctx.fillText(instName, this.data.ww - 84 - instName.length * 16, 60);
    },
    save: function() {
      // let offset_left = (this.data.windowWidth - 303) / 2
      const { ww, wh } = this.data;
      return new Promise((res, rej) => {
        const that = this;
        wx.canvasToTempFilePath(
          {
            x: 0,
            y: 0,
            width: ww,
            height: wh,
            canvasId: "poster",
            success: function(url) {
              res(url.tempFilePath);
              setTimeout(() => {
                that.setData({
                  step: 2,
                  preview: url.tempFilePath
                });
                setTimeout(() => {
                  wx.hideLoading();
                }, 300);
              }, 500);
            },
            fail(e) {
              rej(e);
            }
          },
          this
        );
      });
    },
    preview: function() {
      const { preview: url } = this.data;
      wx.previewImage({
        urls: [url]
      });
    },
    saveToAlbum: function() {
      const { preview: filePath } = this.data;
      wx.saveImageToPhotosAlbum({
        filePath
      });
    },
    cancel: function() {
      this.setData({
        step: 0,
        preview: ""
      });
      wx.hideLoading();
    },
    create: async function(e) {
      wx.showLoading({
        title: "海报生产中..."
      });
      this.setData({
        step: 1
      });
      const { bg, ww, wh } = this.data;
      // const {  } = this.getImageInfo(bg);
      const context = wx.createCanvasContext("poster", this);
      // 画背景
      await this.drawImg(context, bg, 0, 0, ww, wh);
      // 画头像
      // const { avatar, name, institution = {} } = wx.getStorageSync("user");
      // const instName = institution.name || "未知机构";
      // await this.drawImg(context, avatar, ww - 74, 10, 64, 64, true);
      // await this.drawAvarta(context, name, instName);
      // 获取二维码base64字串
      let qr = await this.getQr();
      // 将二维码字串转为本地图片
      if (!qr) {
        this.setData({
          step: 0
        });
        wx.hideLoading();
        return;
      }
      const _qr = await base64src(qr);
      // 画码
      await this.drawQr(context, _qr, {
        x: 10,
        y: wh - 150,
        w: 140,
        h: 140,
        bgc: "rgba(255, 255, 255, 0.6)"
      });
      // 画线
      this.drawLine(context);
      // 画文字
      this.text(context, this.properties.title);
      context.draw(false, () => {
        setTimeout(async () => {
          await this.save();
        }, 200);
      });
    }
  }
});
