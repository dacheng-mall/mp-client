let delay = null
Component({
  properties: {
    video: {
      type: Object | null,
      value: null,
      observer: function(newVal){
        if(newVal !== null) {
          this.setData({
            current: 'video'
          })
        }
      }
    },
    images: {
      type: Array | null,
      value: null
    },
    size: {
      type: String,
      observer: function(newVal) {
        if (newVal) {
          const [width, height] = newVal.split(",");
          this.sizer(width, height);
        }
      }
    }
  },
  data: {
    current: "",
    swiperCurrent: 0,
    sizeStyle: "",
    btnStyle: "padding: 0 12px",
    showChangeBtn: false,
    delay: null
  },
  lifetimes: {
    ready() {
      if (this.properties.video) {
        this.videoCtx = wx.createVideoContext("first-video", this);
      }
      this.setData({
        current: this.properties.video ? "video" : "image"
      });
      this.changeType(this.properties.video ? "video" : "image")
    }
  },
  methods: {
    changeViewType: function(e) {
      this.changeType(e.target.dataset.code);
      if (e.target.dataset.code === "image" && this.videoCtx) {
        this.videoCtx.pause();
      } else if (e.target.dataset.code === "video" && this.videoCtx) {
        this.videoCtx.play();
      }
    },
    changeType(type) {
      this.setShowChangeBtn({current: type});
    },
    setShowChangeBtn(state = {}) {
      if(this.delay) {
        clearTimeout(this.delay);
        this.delay = null
      }
      this.setData({
        showChangeBtn: true,
        ...state
      });
      this.delay = setTimeout(() => {
        this.setData({
          showChangeBtn: false,
        });
      }, 3000);
    },
    sizer(width, height) {
      let sizeStyle = "";
      const { screenWidth } = wx.getSystemInfoSync();
      if (height) {
        sizeStyle += `height: ${height}px;`;
      } else {
        sizeStyle += `height: ${screenWidth}px;`;
      }
      if (width) {
        sizeStyle += `width: ${width}px;`;
      } else {
        sizeStyle += `width: ${screenWidth}px;`;
      }
      this.setData({
        sizeStyle
      });
    },
    ts(e){
      if(this.properties.video && this.properties.images){
        this._x = e.changedTouches[0].clientX;
      }
    },
    te(e){
      if(this.properties.video && this.properties.images){
        const _x = e.changedTouches[0].clientX;
        if((_x - this._x >= 100 && this.data.current === "image") && this.data.swiperCurrent === 0) {
          this.changeType("video")
        } else if (_x - this._x <= -100 && this.data.current === "video"){
          this.changeType("image")
        }
        delete this._x
      }
    },
    change({detail: {current}}){
      this.setData({
        swiperCurrent: current,
      });
      if(current === 0) {
        this.setShowChangeBtn({});
      }
    },
    videoTap(){
      this.changeType('video')
    }
  }
});
