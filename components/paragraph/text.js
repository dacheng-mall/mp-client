const DEFAULT_STYLE = {
  align: "center",
  size: 30,
  padding: 64,
  color: "#333",
  italic: false,
  weight: "normal"
};
Component({
  relations: {
    "./index": {
      type: "parent"
    }
  },
  properties: {
    data: {
      type: Object,
      value: {
        value: "hello world",
        ...DEFAULT_STYLE
      }
    }
  },
  data: {},
  lifetimes: {
    attached() {
      const { data } = this.properties;
      const _data = Object.assign({}, DEFAULT_STYLE, data);
      let style = "";
      let value = "";
      for (let key in _data) {
        if (_data.hasOwnProperty(key)) {
          switch (key) {
            case "value": {
              value = _data[key];
              break;
            }
            case "align": {
              style += `text-align:${_data[key]};`;
              break;
            }
            case "size": {
              style += `font-size:${_data[key]}rpx;`;
              break;
            }
            case "padding": {
              style += `padding:${_data[key]}rpx;`;
              break;
            }
            case "color": {
              style += `color:${_data[key]};`;
              break;
            }
            case "padding": {
              style += `padding:${_data[key]}rpx;`;
              break;
            }
            case "color": {
              style += `color:${_data[key]};`;
              break;
            }
            case "weight": {
              style += `font-weight:${_data[key]};`;
              break;
            }
            case "italic": {
              if (_data[key]) {
                style += `font-style: italic;`;
              } else {
                style += `font-style: normal;`;
              }
              break;
            }
          }
        }
      }
      this.setData({
        style,
        value
      });
    }
  },
  motheds: {}
});
