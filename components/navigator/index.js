import { homePath } from "../../setting";
const app = getApp();
Component({
  properties: {
    navbarData: {
      // navbarData 由父页面传递的数据
      type: Object,
      value: {},
      observer: function(newVal, oldVal) {}
    }
  },
  data: {
    haveBack: true, // 是否有返回按钮，true 有 false 没有 若从分享页进入则没有返回按钮
    statusBarHeight: 0, // 状态栏高度
    navbarHeight: 0, // 顶部导航栏高度
    navbarBtn: {
      // 胶囊位置信息
      height: 0,
      width: 0,
      top: 0,
      bottom: 0,
      right: 0
    }
  },
  // 微信7.0.0支持wx.getMenuButtonBoundingClientRect()获得胶囊按钮高度
  attached: function() {
    this.init();
  },
  methods: {
    init: function() {
      const { statusBarHeight } = wx.getSystemInfoSync();
      const navbarBtn = wx.getMenuButtonBoundingClientRect();
      const { height, bottom } = navbarBtn;
      const padding = bottom - height - statusBarHeight;
      const navbarHeight = bottom + padding;
      const titleHeight = 2 * padding + height;
      let haveBack;
      if (getCurrentPages().length === 1) {
        // 当只有一个页面时，并且是从分享页进入
        haveBack = false;
      } else {
        haveBack = true;
      }
      this.setData({
        haveBack, // 获取是否是通过分享进入的小程序
        statusBarHeight,
        navbarHeight, // 胶囊bottom + 胶囊实际bottom
        navbarBtn,
        titleHeight,
        padding
      });
    },
    tapLeft: function() {
      if (this.data.haveBack) {
        wx.navigateBack({
          delta: 1
        });
      } else {
        wx.reLaunch({
          url: `/${homePath}`
        });
      }
    }
  }
});
