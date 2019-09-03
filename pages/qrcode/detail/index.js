import { declassify } from "../../../utils/util";
import regeneratorRuntime from "../../../utils/regenerator-runtime/runtime";

Component({
  properties: {
    bottom: null,
    img: null,
    typeName: null,
    fields: {
      type: String,
      observer: function(newVal) {
        if (newVal) {
          this.renderTemplate(newVal, this.properties.template);
        }
      },
      value: ""
    },
    template: null
  },
  data: {},
  methods: {
    renderTemplate(val, template) {
      // 这里开始渲染模板
      const value = val ? JSON.parse(val) : {};
      for (let key in value) {
        template = template.replace(`{{${key}}}`, value[key]);
      }
      let temp = JSON.parse(template);
      function render(nodes) {
        nodes.forEach(node => {
          if (node.children && node.children.length > 0) {
            // 有子节点
            render(node.children);
          }
          if (node.key && !value[node.key]) {
            if (!node.attrs) {
              node.attrs = node.attrs || { style: "display: none" };
            } else if (!node.attrs.style) {
              node.attrs.style = "display: none";
            } else {
              node.attrs.style += "display: none";
            }
          }
        });
      }
      render(temp.nodes);
      temp.more &&
        temp.more.forEach(m => {
          if (!value[m.key]) {
            m.disabled = true;
          } else {
            m.value = value[m.key];
          }
        });
      this.setData({
        temp
      });
    },
    onTap(e) {
      const info = e.currentTarget.dataset.info;
      switch (info.type) {
        case "phoneCall": {
          this.makePhoneCall(info.value);
          break;
        }
        default: {
          break;
        }
      }
    },
    getPhoneNumber(e) {
      if (e.detail.iv && e.detail.encryptedData) {
        // 点击了允许
        this.triggerEvent("mackCall", {
          ...e.detail,
          bindNumberB: e.currentTarget.dataset.info.value
        });
      }
    }
  }
});
