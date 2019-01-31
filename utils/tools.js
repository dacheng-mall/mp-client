import { mockFetch } from "./util";
import { favorites } from "./mock";
import { get } from "./request";

// TODO 临时封装本地存储工具函数,接现网api后需要重构
export const getStorageWithKey = (key, fetchFromServer) => {
  if (key === undefined || key === null) {
    throw new Error("第一个参数 key 是必填的");
  }
  return new Promise((res, rej) => {
    wx.getStorage({
      key,
      success: ({ data }) => {
        res(data);
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
      return getStorageWithKey(
        "favorites",
        () => get("api/sys/favorites/productIds", { userId })
      );
    })
    .then(data => {
      return data;
    });

export const setFavorites = ids => {
  return getFavorites().then(data => {
    ids.forEach(id => {
      const favoIndex = data.indexOf(id);
      if (favoIndex !== -1) {
        // 取消收藏
        data.splice(favoIndex, 1);
        wx.showToast({
          title: "取消收藏"
        });
      } else {
        // 收藏
        data.push(id);
        wx.showToast({
          title: "收藏成功"
        });
      }
      wx.setStorageSync("favorites", data);
    });
    return data
  });
};
