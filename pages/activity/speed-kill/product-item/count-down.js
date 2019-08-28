import moment from "moment";
const DURING = 1000;

Component({
  properties: {
    now: {
      type: String
    },
    beginTime: {
      type: String
    },
    status: {
      type: String
    },
    leaveTime: {
      type: Number
    },
    active: {
      type: Boolean,
      value: false,
      observer: function(newVal, oldVal) {
        if (this.properties.status === "waiting") {
          if (newVal && newVal !== oldVal) {
            const currentDate = moment(
              moment(this.data.beginTime).format("YYYY-MM-DD 00:00:00")
            );
            const beginDate = moment(
              moment(this.data.beginTime).format("YYYY-MM-DD HH:mm:ss")
            );
            const lastTime = beginDate.diff(currentDate);
            const interval = setInterval(() => {
              this.render(this.data.leaveTime, lastTime, this.data.beginTime);
              if(this.data.leaveTime > 0) {

                this.setData({
                  leaveTime:
                    this.data.leaveTime > DURING
                      ? this.data.leaveTime - DURING
                      : 0
                });
              } else {
                this.triggerEvent("reload");
              }
            }, DURING);
            this.setData({ interval });
          } else {
            this.clear();
          }
        } else {
          this.setData({
            text: "售罄"
          });
        }
      }
    }
  },
  data: {
    interval: null,
    text: { msg: "正在计算", size: 'mini' }
  },
  lifetimes: {
    detached: function() {
      this.clear();
    }
  },
  methods: {
    clear: function() {
      if (this.data.interval) {
        clearInterval(this.data.interval);
      }
    },
    render: function(time, last, begin) {
      const second = 1000,
        minute = 60 * second,
        hour = 60 * minute;
      switch (true) {
        case time > last: {
          const date = moment(begin).format("MM月DD日");
          const timeHour = moment(begin).format("HH");
          const timeMinute = moment(begin).format("mm");
          const timeSecnod = moment(begin).format("ss");
          let time = '';
          if(timeMinute === '00' && timeSecnod === '00') {
            time = `${timeHour}点整`
          } else if (timeSecnod === '00' && timeMinute !== '00') {
            time = `${timeHour}点${timeMinute}分`
          } else if(timeSecnod !== '00' && timeMinute !== '00'){
            time = `${timeHour}点${timeMinute}分${timeSecnod}秒`
          } else if (timeSecnod !== '00' && timeMinute === '00') {
            time = `${timeHour}点${timeSecnod}秒`
          }
          this.setData({
            jump: false,
            text: { date, time, msg: "开抢" }
          });
          break;
        }
        default: {
          const _h = Math.floor(time / hour);
          let last = time % hour;
          const _m = Math.floor(last / minute);
          last = last % minute;
          const _s = Math.floor(last / second);
          last = last % second;
          this.setData({
            jump: true,
            text: {
              msg: `${_h > 0 ? `${_h >= 10 ? _h : `0${_h}`}:` : ""}${
                _m > 0 ? `${_m >= 10 ? _m : `0${_m}`}:` : ""
              }${_s > 0 ? `${_s >= 10 ? _s : `0${_s}`}` : "00"}`,
              size: _h > 0 ? 'small' : (_m > 0 ? 'middle' : 'large')
            }
          });
        }
      }
    }
  }
});
