import { get } from "../../../utils/request";
import regeneratorRuntime from "../../../utils/regenerator-runtime/runtime";

Page({
  data: {
    list: [],
    delta: 0,
    rootid: "",
    name: ""
  },
  onShow() {
    const { pid, delta, rootid = null, name = null } = this.options;
    try {
      wx.setStorageSync('bind_rootid', rootid);
      wx.setStorageSync('bind_id', pid);
      wx.setStorageSync('bind_name', name);
    } catch (e) { }
    this.fetch(pid, delta, rootid, name);
  },
  fetch: async function(pid, delta, rootid, name) {
    const data = await get("v1/api/sys/institution", { pid });
    if (data.length > 0) {
      this.setData({
        list: data,
        delta,
        rootid,
        name
      });
    } else {
      wx.navigateBack({
        delta: parseInt(delta, 10),
      })
    }
  },
  back(){
    wx.navigateBack({
      delta: parseInt(this.data.delta, 10),
    })
  },
  next(e) {
    const { rootid, delta } = this.data;
    const _delta = parseInt(delta) + 1;
    const {id, name} = e.currentTarget.dataset;
    const _rootid = rootid || id;
    // try {
    //   wx.setStorageSync('bind_rootid', _rootid);
    //   wx.setStorageSync('bind_id', id);
    //   wx.setStorageSync('bind_name', name);
    // } catch (e) { }
    wx.navigateTo({
      url: `/pages/personal/bind/instList?pid=${id}&delta=${_delta}&rootid=${_rootid}&name=${name}`
    });
  }
});
