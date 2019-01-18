import { get } from "../../utils/request";
Page({
  data: {
    elements: [],
    code: ''
  },
  onLoad(options) {
    const { code } = options;
    get("v1/api/sys/page", { code }).then(([data]) => {
      console.log(data);
      this.setData({
        ...data
      })
    });
  }
});
