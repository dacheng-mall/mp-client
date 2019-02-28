import { get } from "./request";

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
        get("api/sys/favorites/productIds", { userId })
      );
    })
    .then(data => {
      return data;
    });

export const setFavorites = ids => {
  wx.setStorageSync("favorites", ids);
  return ids;
};
