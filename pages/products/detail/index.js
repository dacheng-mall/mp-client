// pages/products/index.js
import { product } from "./mock";
import { mockFetch, uri } from "../../../utils/util";

Page({
  data: {
    detail: [],
    stockUp: null,
    offsetLeft: 0,
    opacity: 1,
    ids: [],
    current: "",
    screenWidth: 100
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
        // 预请求数据
        return this.fetchDetail(data);
      })
      .then(data => {
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
    // 这个mock就像一坨屎!!!
    return mockFetch({ id: _ids[0], ...product }, 100);
  },
  onShareAppMessage(options) {
    console.log(options.webViewUrl);
  },
  stockUpParse(data) {
    const range = data.split(",");
    if (range.length > 1) {
      return `${range[0]}-${range[1]}天`;
    } else if (range.length < 1) {
      return "";
    } else {
      return `${range[0]}天`;
    }
  },
  detailTap(e) {
    const { type } = e.target.dataset;
  },
  touchstart(e) {
    if (this.data.ids.length > 1) {
      this._x = e.changedTouches[0].clientX;
    }
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
            .left(offsetLeft > 0 ? 150 : -150)
            .opacity(0)
            .step({
              duration: 200
            })
            .left(offsetLeft > 0 ? -150 : 150)
            .step({
              duration: 0
            })
            .left(0)
            .opacity(1)
            .step({
              duration: 200
            });
          this.setData({
            animation: this.animation.export()
          });
          if (offsetLeft > 0) {
            this.changeDetail("left", this.data.current - 1);
          } else {
            this.changeDetail("right", this.data.current + 1);
          }
        }
      }
      delete this._x;
    }
  },
  changeDetail(type, next) {
    if (next < 0 || next > this.data.ids.length - 1) {
      return false;
    }
    this.fetchDetail(this.data.ids[next])
      .then(data => {
        this.setData({
          current: next,
          [`detail[${next}]`]: data
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
    const path = uri(this.route, this.options)
    if (target) {
      return {
        title: target.title,
        path,
        imageUrl: target.images[0].url
      };
    }
  }
});
