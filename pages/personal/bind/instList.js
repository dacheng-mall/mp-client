import { get } from "../../../utils/request";
import regeneratorRuntime from "../../../utils/regenerator-runtime/runtime";

Page({
  data: {
    list: [],
    delta: 0,
    rootid: "",
    name: "",
    role: 'null'
  },
  onShow() {
    const { pid, delta, rootid = null, name = null, role } = this.options;
    try {
      wx.setStorageSync("bind_rootid", rootid);
      wx.setStorageSync("bind_id", pid);
      wx.setStorageSync("bind_name", name);
    } catch (e) {}
    this.fetch(pid, delta, rootid, name, role);
  },
  fetch: async function(pid, delta, rootid, name, role = null) {
    const data = await get("v1/api/sys/institution", { pid, status: 1 });
    if (data.length > 0) {
      this.setData({
        list: data,
        delta,
        rootid,
        name,
        role
      });
    } else {
      wx.navigateBack({
        delta: parseInt(delta, 10)
      });
    }
  },
  back() {
    wx.navigateBack({
      delta: parseInt(this.data.delta, 10)
    });
  },
  next(e) {
    const { rootid, delta, role } = this.data;
    const _delta = parseInt(delta) + 1;
    const { id, name } = e.currentTarget.dataset;
    const _rootid = rootid || id;
    wx.navigateTo({
      url: `/pages/personal/bind/instList?pid=${id}&delta=${_delta}&rootid=${_rootid}&name=${name}&role=${role}`
    });
  },
  choose: function(e) {
    const { role } = e.currentTarget.dataset;
    this.setData({
      role
    });
  }
});
