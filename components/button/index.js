const ICON_TYPE_COLOR = {
  primary: "#fff",
  danger: "#fff",
  warning: "#fff",
  ghost: "#999",
  disabled: "#aaa"
};
const ICON_TYPE_SIZE = {
  default: 40,
  large: 44,
  small: 29
};

Component({
  properties: {
    value: {
      type: String
    },
    icon: {
      type: String
    },
    color: {
      type: String,
      value: "#333"
    },
    style: {
      type: String
    },
    disabled: {
      type: Boolean,
      value: false
    },
    size: {
      type: String,
      value: "default",
      observer: function(val, oldval) {
        if (!["default", "large", "small"].includes(val)) {
          this.setData({
            size: "default",
            iconSize: ICON_TYPE_SIZE["default"]
          });
        } else {
          this.setData({
            size: val,
            iconSize: ICON_TYPE_SIZE[val]
          });
        }
      }
    },
    type: {
      type: String,
      observer: function(val) {
        if (!["ghost", "primary", "danger", "warning"].includes(val)) {
          this.setData({
            type: "primary",
            color: ICON_TYPE_COLOR["primary"]
          });
        } else {
          this.setData({
            type: val,
            color: ICON_TYPE_COLOR[val]
          });
        }
      }
    }
  },
  data: {
    iconSize: ICON_TYPE_SIZE["default"],
    color: ICON_TYPE_COLOR["default"]
  },
  methods: {
    tap: function(e) {
      if (!this.data.diaabled) {
        this.triggerEvent("click");
      }
    }
  }
});
