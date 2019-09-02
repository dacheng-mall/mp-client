import { hexMD5 } from "../../../access/md5";
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
          // wx.makePhoneCall({
          //   phoneNumber: info.value
          // });
          break;
        }
        default: {
          break;
        }
      }
    },
    // makeSign: function() {
    //   const timestamp = new Date().valueOf();
    //   return hexMD5(`${winnerLookAppid}${winnerLookToken}${timestamp}`);
    // },
    // makePhoneCall: async function(number) {
    //   const sig = this.makeSign();
    // },
    getPhoneNumber(e) {
      // const PHONE = "13663002168";
      // const sig = this.makeSign();
      // const { value } = e.currentTarget.dataset.info;
      // console.log('拨打: ', PHONE);
      // console.log('接听: ', value);
      // console.log('sig: ', sig);
      //==========================

      // wx.checkSession({
      //   success: function(res) {
      //     // 前端检查用户session, 如果没过期限走这里
      //     console.log("success", res);
      //   },
      //   fail: function(res) {
      //     // 否则走这里, 用户重新登录, 获取code
      //     console.log("fail", res);
      //     wx.login({
      //       success: function(res) {
      //         console.log("login", res);
      //       }
      //     });
      //   }
      // });
      // console.log('===', e);

      console.log(e);
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
