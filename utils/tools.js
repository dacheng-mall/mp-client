import { get } from "./request";
import { notice } from "./util";

Date.prototype.Format = function(fmt) {
  const o = {
    "M+": this.getMonth() + 1, //月份
    "d+": this.getDate(), //日
    "h+": this.getHours(), //小时
    "m+": this.getMinutes(), //分
    "s+": this.getSeconds(), //秒
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
    S: this.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(
      RegExp.$1,
      (this.getFullYear() + "").substr(4 - RegExp.$1.length)
    );
  for (let k in o)
    if (new RegExp("(" + k + ")").test(fmt))
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
      );
  return fmt;
};

// TODO 临时封装本地存储工具函数,接现网api后需要重构
export const getStorageWithKey = (key, fetchFromServer) => {
  if (key === undefined || key === null) {
    throw new Error("第一个参数 key 是必填的");
  }
  return new Promise((res, rej) => {
    wx.getStorage({
      key,
      success: ({ data = [] }) => {
        if (key === "favorites" && data.length === 0) {
          if (fetchFromServer) {
            fetchFromServer().then(data => {
              wx.setStorageSync(key, data);
              res(data);
            });
          } else {
            res(data);
          }
        } else {
          res(data);
        }
      },
      fail: err => {
        if (fetchFromServer) {
          fetchFromServer().then(data => {
            wx.setStorageSync(key, data);
            res(data);
          });
        } else {
          rej(err);
        }
      }
    });
  });
};
export const getFavorites = () =>
  getStorageWithKey("user")
    .then(user => {
      return user.id;
    })
    .then(userId => {
      return getStorageWithKey("favorites", () =>
        get("v1/api/sys/favorites/productIds", { userId })
      );
    })
    .then(data => {
      return data;
    }).catch((e) => {});

export const setFavorites = ids => {
  wx.setStorageSync("favorites", ids);
  return ids;
};
