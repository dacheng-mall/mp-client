let animation;
const size = 3; // 矩阵尺寸 3x3
const count = Math.pow(size, 2) - Math.pow(size - 2, 2); // 总共8个奖项位;
const nullName = "感谢参与";

const MAX = 1000000000;

Component({
  properties: {
    data: {
      type: Array,
      observer: function(newVal) {
        if (newVal.length > 0) {
          this.init(newVal);
        }
      }
    },
    times: {
      type: Number,
      value: 0
    },
    disabled: {
      type: Boolean,
      value: true
    }
  },
  data: {
    current: null,
    pow: 4, // 精度概率,
    result: null
  },
  lifetimes: {
    attached: function() {
      this.twinkle = setInterval(() => {
        this.setData({
          twinkle: this.data.twinkle ? false : true
        });
      }, 500);
    },
    detached: function() {
      if (this.twinkle) {
        clearInterval(this.twinkle);
      }
    }
  },
  methods: {
    init: function(data) {
      this.setData({ ...this.makeItems(data), size: this.getSize() });
    },
    getSize: function(rate = 0.85) {
      const res = Object.create(null);
      const { windowWidth } = wx.getSystemInfoSync();
      res.wrap = windowWidth * rate;
      res.cont = res.wrap - 40;
      res.item = Math.floor(res.cont / 3);
      res.bgItems = this.makeBg(res.wrap);
      return res;
    },
    makeBg: function(size) {
      const itemWidth = Math.floor(size / 6);
      const res = [];
      let count = 24;
      while (count > 0) {
        res.push(Object.create(null));
        count--;
      }
      res.map((item, i) => {
        if (i === 0) {
          item.left = 0;
          item.top = 0;
          item.width = `${itemWidth}px`;
          item.height = "20px";
          return;
        }
        let sideType = Math.floor(i / 6);
        const isHead = i % 6 === 0;
        const pos = res[i - 1];
        switch (sideType) {
          case 0: {
            // top, y不变, x++
            item.left = pos.left + itemWidth;
            item.top = pos.top;
            item.width = `${itemWidth}px`;
            item.height = "20px";
            if (isHead) {
              item.left = 0;
              item.top = 0;
            }
            break;
          }
          case 1: {
            // right, x不变, y++
            item.top = pos.top + itemWidth;
            item.left = size - 20;
            item.height = `${itemWidth}px`;
            item.width = "20px";
            if (isHead) {
              item.left = size - 20;
              item.top = 0;
            }
            break;
          }
          case 2: {
            // bottom, y不变, x--
            item.top = size - 20;
            item.left = pos.left - itemWidth;
            item.width = `${itemWidth}px`;
            item.height = "20px";
            if (isHead) {
              item.left = size - itemWidth;
            }
            break;
          }
          case 3: {
            // left, x不变, y--
            item.left = 0;
            item.top = pos.top - itemWidth;
            item.height = `${itemWidth}px`;
            item.width = "20px";
            if (isHead) {
              item.top = size - itemWidth;
            }
            break;
          }
        }
      });
      return res;
    },
    // 生成真实奖项, 均匀插入若干无奖项, 使奖项数量达到8
    makeItems: function(data) {
      let itemsCount = data.length; // 奖项数量
      const maxCount = count - 1; // 最大奖项数量需要至少比总格子数少一, 需要留个空奖项
      if (itemsCount > maxCount) {
        // 奖项超过8项时, 取前8项
        data = data.slice(0, maxCount);
        itemsCount = maxCount;
      } else if (itemsCount < 1) {
        return;
      }
      let nullRate = 0, // 空奖概率
        probability = 0, // 中奖概率
        min = 0; // 最小中奖概率

      data.reduce((a, b) => {
        min = a.min || a.probability;
        if (min > b.probability) {
          min = b.probability;
        }
        probability = parseFloat(
          (a.probability + b.probability).toFixed(this.data.pow)
        );
        return { probability, min };
      });
      // 需要填充空奖项的数量
      const nullItemCount = count - itemsCount;
      let nullIndex = "";
      if (nullItemCount > 0) {
        // 如果存在空奖项, 计算空奖项的概率
        nullRate = (1 - probability) / nullItemCount;
        if (!nullRate.isNaN) {
          nullRate = Math.floor(nullRate * MAX) / MAX;
        }
        // 均匀插入空奖项
        let i = 0;
        while (data.length < count) {
          data.splice(i * 2, 0, {
            showName: nullName,
            probability: nullRate,
            isNull: true
          });
          nullIndex += i * 2 + ",";
          i++;
        }
        i = null;
      }
      // 遍历data, 回型矩阵位置定义, 中奖值分部定义
      const initPos = {
        x: 0,
        y: 0
      };
      data.forEach((item, i) => {
        item.showName = item.showName.split(":");
        if (i === 0) {
          item.pos = { ...initPos };
          item.range = this.getRange(0, MAX, item.probability);
          return;
        }
        let sideType = Math.floor(i / (size - 1));
        const isHead = i % (size - 1) === 0;
        if (isHead && sideType > 0) {
          sideType -= 1;
        }
        const { pos, range } = data[i - 1];
        item.range = this.getRange(range[1], MAX, item.probability);
        // 计算位置
        switch (sideType) {
          case 0: {
            // top, y不变, x++
            item.pos = { ...pos, x: pos.x + 1 };
            break;
          }
          case 1: {
            // right, x不变, y++
            item.pos = { ...pos, y: pos.y + 1 };
            break;
          }
          case 2: {
            // bottom, y不变, x--
            item.pos = { ...pos, x: pos.x - 1 };
            break;
          }
          case 3: {
            // left, x不变, y--
            item.pos = { ...pos, y: pos.y - 1 };
            break;
          }
        }
      });
      return { items: data, MAX, nullIndex };
    },
    getRange: function(start, max, probability) {
      const res = new Array(2);
      res[0] = start + 1;
      res[1] = max * probability + res[0];
      return res;
    },
    // 抽奖
    lottery: function() {
      const { isRunning, times, disabled } = this.data;
      if (disabled || times < 1 || isRunning) {
        return;
      }
      this.triggerEvent("onStart");
      // 启动抽奖动画
      this.runAnimation();
      // 先转2秒再计算中奖结果
      const randomNull = (() => {
        const nullIndex = this.data.nullIndex.split(",");
        const res = this.random(0, nullIndex.length - 2);
        return nullIndex[res];
      })();
      setTimeout(() => {
        const target = this.getResult();
        this.triggerEvent("onResult", {
          target: this.data.items[target],
          stop: this.stopAnimation.bind(this),
          index: target,
          nullIndex: randomNull
        });
        // 计算完毕后准备停止
        // 停止逻辑放在外层父组件
        // this.stopAnimation(target);
      }, 2000);
    },
    getResult: function() {
      const { items } = this.data;
      const random = this.random();
      // 计算中奖项
      let itemIndex = 0,
        target;
      while (target === undefined && itemIndex < count) {
        const [min, max] = items[itemIndex].range;
        if (random >= min && random <= max) {
          target = itemIndex;
        } else {
          itemIndex++;
        }
      }
      return target;
    },
    jump: function() {
      let next = this.data.current;
      if (next < count - 1) {
        next += 1;
      } else {
        next = 0;
      }
      this.setData({
        current: next
      });
      if (this.timer) {
        clearTimeout(this.time);
      }
    },
    runAnimation: function(interval = 100) {
      // 启动时为每100ms变更一次
      this.setData({
        isRunning: true
      });
      animation = setInterval(() => {
        this.jump();
      }, interval);
    },
    stopAnimation: function(target) {
      if (animation) {
        clearInterval(animation);
      }
      // 计算再跳几次停止
      let lastJumpCount = target - this.data.current;
      let jumpIndex = 0;
      let pervTime = 100;
      if (lastJumpCount > 0) {
        // 如果还需要继续转, 就加1圈
        lastJumpCount += count;
      } else {
        // 如果转过了就加2圈
        lastJumpCount += 2 * count;
      }
      while (jumpIndex < lastJumpCount) {
        let _index = jumpIndex;
        pervTime += jumpIndex * 50;
        this.timer = setTimeout(() => {
          if (_index === lastJumpCount - 1) {
            this.setData({
              isRunning: false
            });
            this.triggerEvent("onEnd", { target: this.data.items[target] });
            this.showResult(target);
          }
          this.jump();
        }, pervTime);
        jumpIndex++;
      }
    },
    showResult: function(index) {
      const { windowHeight: height } = wx.getSystemInfoSync();
      if (!this.data.result) {
        this.animation = wx.createAnimation({
          duration: 300,
          timingFunction: "ease"
        });
        this.animation
          .top(0)
          .left(0)
          .height(height)
          .width("100%")
          .opacity(1)
          .step();
        this.setData({
          animationData: this.animation.export(),
          result: this.data.items[index]
        });
      } else {
        this.hideResult();
      }
    },
    hideResult: function() {
      this.animation
        .top("50%")
        .left("50%")
        .height(0)
        .width(0)
        .opacity(0)
        .step();
      this.setData({
        animationData: this.animation.export(),
        result: null
      });
    },
    showDetail: function(e) {
      const { index } = e.currentTarget.dataset;
      const target = this.data.items[index];
      this.hideResult();
      if (!target.isNull) {
        this.triggerEvent("showMyPrize", target);
      }
    },
    // 生成区间内的随机数
    random: function(n = 1, m = MAX) {
      return Math.floor(Math.random() * (n - m) + m);
    },
    // 测试真实概率与预期概率差异
    test: function() {
      console.time("测试耗时");
      const TIME = 5000;
      const { items } = this.data;
      let times = TIME;
      const res = new Array(8);
      while (times > 0) {
        const target = this.getResult(MAX);
        res[target] =
          res[target] === undefined
            ? {
                name: items[target].name,
                count: 1,
                probability: items[target].probability
              }
            : { ...res[target], count: res[target].count + 1 };
        times--;
      }
      const total = res.reduce((a, b) => {
        return {
          name: "合计",
          probability: a.probability + b.probability,
          realChance: a.realChance + b.realChance,
          count: a.count + b.count
        };
      });
      res.push(total);
      const _res = res.map(data => {
        data.realChance = data.count / TIME;
        if (data) {
          return {
            奖项: data.name,
            中奖次数: data.count,
            预期概率: (data.probability * 100).toFixed(4) + "%",
            真实概率: (data.realChance * 100).toFixed(4) + "%"
          };
        }
      });
      console.table(_res);
      console.timeEnd("测试耗时");
    }
  }
});
