import { get } from "../../utils/request";
Page({
  onLoad(options) {
    console.log(options);
    const { code } = options;
    get('v1/api/sys/page', options).then(([data]) => {
      console.log(data)
    })
  }
});
