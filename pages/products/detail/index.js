// pages/products/index.js
import { uri } from "../../../utils/util";
import { get, post } from "../../../utils/request";
import { getFavorites, setFavorites, getStorageWithKey } from "../../../utils/tools";
import { source, tel } from "../../../setting";
import regeneratorRuntime from "../../../utils/regenerator-runtime/runtime";

Page({
  data: {
    detail: [],
    stockUp: null,
    offsetLeft: 0,
    opacity: 1,
    ids: [],
    current: "",
    screenWidth: 100,
    needInitSwiper: false,
  },
  onLoad(opts) {
    const { screenWidth } = wx.getSystemInfoSync();
    const ids = opts.ids ? opts.ids.split(",") : [opts.id];
    const current = ids
      ? ids.indexOf(opts.id) === -1
        ? 0
        : ids.indexOf(opts.id)
      : 0;
    this.setData({
      ids: ids,
      current,
      screenWidth
    });

    this.fetchDetail(opts.id)
      .then(data => {
        // 这里初始化详情数据, 可能是一条或者多条, 预请求临近的数据
        const detail = ids.length > 0 ? new Array(ids.length) : [];
        detail[current] = data;
        this.setData({
          detail
        });
        // 确定需要预请求的数据主键
        let preFetchByIds = [];
        if (current > 0) {
          preFetchByIds.unshift(ids[current - 1]);
        }
        if (current < ids.length - 1) {
          preFetchByIds.push(ids[current + 1]);
        }
        return preFetchByIds.join(",");
      })
      .then(data => {
        if (!data) {
          return false;
        }
        // 预请求数据
        return this.fetchDetail(data);
      })
      .then(data => {
        if (!data) {
          return;
        }
        // 更新状态数据
        const detail = this.data.detail;
        const ids = this.data.ids;
        if (!(data instanceof Array)) {
          data = [data];
        }
        for (let d of data) {
          const index = ids ? ids.indexOf(d.id) : -1;
          if (index !== -1) {
            detail[index] = d;
          }
        }
        this.setData({
          detail
        });
      });
  },
  onReady: function() {
    this.animation = wx.createAnimation();
  },
  fetchDetail(data) {
    const _ids = data.split(",");
    if (_ids.length > 1) {
      // 如果需要请求多条, 从current向两方向同时请求
      return Promise.all(_ids.map(id => this.fetchDetail(id)));
    }
    const index = this.data.ids.indexOf(_ids[0]);
    if (this.data.detail[index]) {
      return Promise.resolve(this.data.detail[index]);
    }
    return get("api/sys/product", { id: data })
      .then(data => {
        if (data.length > 0) {
          return this.normalize(data[0]);
        }
        Promise.reject("没数据");
      })
      .catch(err => {
        console.log(err);
      });
  },
  /**
   * 序列化商品数据咯
   * @param {*Object 远程获得的真实商品数据} data
   * @returns 组件可用的渲染数据
   */
  async normalize(data) {
    for (let key in data) {
      switch (key) {
        case "attributes":
        case "content":
        case "information": {
          const value = data[key];
          if (value) {
            data[key] = JSON.parse(value);
            if (key === "content") {
              data[key].forEach((item, i) => {
                if (item.type === "image") {
                  item.value = `${source}${item.value}`;
                }
              });
            }
          }
          break;
        }
        case "images": {
          const value = data[key];
          const video = {};
          const images = [];
          if (value.length > 0) {
            value.forEach(item => {
              const { type, name, poster } = item;
              if (type === "image") {
                const image = {};
                image.url = `${source}${name}`;
                image.name = name;
                image.type = type;
                images.push(image);
              } else if (type === "video") {
                if (poster) {
                  video.poster = `${source}${poster}`;
                }
                if (name) {
                  video.url = `${source}${name}`;
                  data.video = video;
                }
              }
            });
            data.images = images;
          }
          break;
        }
        default: {
          break;
        }
      }
    }
    const favoData = await getFavorites();
    if (favoData.includes(data.id)) {
      data.favorite = true;
    } else {
      data.favorite = false;
    }
    return data;
  },
  async changeFavo(e) {
    const {
      currentTarget: {
        dataset: { id, favo }
      }
    } = e;
    const {id: userId} = await getStorageWithKey("user");
    let res;
    if(favo) {
      res = await post("api/sys/favorites/delete", { userId, ids: [id] });
    } else {
      res = await post("api/sys/favorites", { userId, ids: [id] })
    }
    if(typeof res === 'object') {
      await setFavorites([id]);
      this.data.detail[this.data.current].favorite = !favo
      this.setData({
        detail: [...this.data.detail]
      })
    }
  },
  onShareAppMessage(options) {
    // console.log(options.webViewUrl);
  },
  touchstart(e) {
    if (this.data.ids.length > 1) {
      this._x = e.changedTouches[0].clientX;
    }
  },
  callServer() {
    wx.makePhoneCall({
      phoneNumber: tel
    });
  },
  initilized() {
    // 滚图初始化完成后变更状态, 每次切换商品时执行
    this.setData({
      needInitSwiper: false
    });
  },
  touchend(e) {
    if (this.data.ids.length > 1) {
      const currentX = e.changedTouches[0].clientX;
      const offsetLeft = currentX - this._x;
      if (Math.abs(offsetLeft) > 100) {
        if (
          (this.data.current === 0 && offsetLeft < 0) ||
          (this.data.current === this.data.ids.length - 1 && offsetLeft >= 0) ||
          (this.data.current > 0 &&
            this.data.current < this.data.ids.length - 1)
        ) {
          this.animation
            // .left(offsetLeft > 0 ? 150 : -150)
            .opacity(0)
            .step({
              duration: 200
            })
            // .left(offsetLeft > 0 ? -150 : 150)
            // .step({
            //   duration: 0,
            // })
            // .left(0)
            .opacity(1)
            .step({
              duration: 200
            });
          this.setData({
            animation: this.animation.export()
          });
          const that = this;
          setTimeout(() => {
            if (offsetLeft > 0) {
              that.changeDetail("left", that.data.current - 1);
            } else {
              that.changeDetail("right", that.data.current + 1);
            }
          }, 0);
        }
      }
      delete this._x;
    }
  },
  changeDetail(type, next) {
    if (next < 0 || next > this.data.ids.length - 1) {
      return false;
    }
    // 在这里执行swiper-x组件的初始化
    this.fetchDetail(this.data.ids[next])
      .then(data => {
        this.setData({
          current: next,
          [`detail[${next}]`]: data,
          needInitSwiper: true
        });
        return type === "right" ? next + 1 : next - 1;
      })
      .then(next => {
        if (next < this.data.ids.length && next > 0) {
          this.fetchDetail(this.data.ids[next]).then(data => {
            this.setData({
              [`detail[${next}]`]: data
            });
          });
        }
      });
  },
  share() {
    wx.showShareMenu({
      withShareTicket: false
    });
  },
  onShareAppMessage(e) {
    const target = this.data.detail[this.data.current];
    const path = uri(this.route, this.options);
    if (target) {
      return {
        title: target.title,
        path,
        imageUrl: target.images[0].url
      };
    }
  }
});
