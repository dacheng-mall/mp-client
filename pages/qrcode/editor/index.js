import { validateMobile, validateCarLisence ,validateIdcard, validateName } from "../../../utils/util";
Component({
  properties: {
    value: {
      type: Object,
      value: {}
    },
    fields: {
      type: String,
      observer: function(newVal) {
        let fields = ''
        if (newVal) {
          fields = JSON.parse(newVal);
        }
        this.setData({
          data: fields
        });
      },
      value: ""
    }
  },
  data: {
    data: []
  },
  methods: {
    get: function(){
      this.triggerEvent("onSubmit", 'bindUser');
    },
    formSubmit: function(e) {
      const { value } = e.detail;
      for (let { code, required, label } of this.data.data) {
        const unexist =
          !value[code] && (value[code] !== 0 || value[code] !== false);
        // 验证必填时存在
        if (required && unexist) {
          wx.showToast({
            title: `${label}是必填项`,
            icon: "none"
          });
          return;
        }
        // 验证存在时的格式
        if (/mobile/.test(code) && !unexist) {
          const msg = validateMobile(value[code]);
          if (msg) {
            wx.showToast({
              title: `${label}: ${msg}`,
              icon: "none"
            });
            return;
          }
        }
        if (/carLisence/.test(code) && !unexist) {
          const msg = validateCarLisence(value[code]);
          if (msg) {
            wx.showToast({
              title: `${label}: ${msg}`,
              icon: "none"
            });
            return;
          }
        }
        if (/name/.test(code) && !unexist) {
          const msg = validateName(value[code]);
          if (msg) {
            wx.showToast({
              title: `${label}: ${msg}`,
              icon: "none"
            });
            return;
          }
        }
        if (/idcard/.test(code) && !unexist) {
          const msg = validateIdcard(value[code]);
          if (msg) {
            wx.showToast({
              title: `${label}: ${msg}`,
              icon: "none"
            });
            return;
          }
        }
      }
      // 验证通过之后的逻辑
      this.triggerEvent("onSubmit", value);
    }
  }
});
