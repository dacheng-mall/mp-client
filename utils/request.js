import { apiUrl, aliApiUrl } from "../setting.js";
import { notice } from "./util";

const CONTENT_TYPE = "Content-Type";
const JSON_TYPE = "application/json";

const baseURL = aliApiUrl;
export function getApi() {
  return baseURL;
}
let errorTimer = "";
let token = "";
export function setToken(t) {
  if (t === "") {
    token = t;
    wx.removeStorageSync("token");
    return;
  }
  if (!/^Bearer\s/.test(t)) {
    token = `Bearer ${t}`;
  } else {
    token = t;
  }
  wx.setStorageSync("token", token);
}
export function getToken() {
  if (token) {
    return token;
  }
  return wx.getStorageSync("token");
}

export function getType(res) {
  return res.headers.get(CONTENT_TYPE);
}

const showLoading = (url, show) => {
  switch (true) {
    case url === "api/sys/favorites/set":
    case /^v1\/api\/public\/saveImg/.test(url):
    case /^v1\/api\/sys\/favorites\/productIds/.test(url):
    case /^v1\/api\/wx\/createWXAQRCode/.test(url):
    case /^v1\/api\/sys\/giftProduct/.test(url): {
      break;
    }
    default: {
      if (show) {
        wx.showLoading({
          title: "加载中...",
          mask: true
        });
      } else {
        wx.hideLoading();
      }
      break;
    }
  }
};
export function parseResponse({ data, _url }) {
  // TODO 这里只处理了json类型的返回值, 如果有其他类型的需要再扩展
  showLoading(_url);
  return Promise.resolve(data);
}
export function checkStatus({ res, _url }) {
  const { statusCode, data } = res;
  if (statusCode !== 200) {
    return Promise.reject({ statusCode, data });
    // return Promise.reject(`${statusCode}-${data}`);
  }
  return Promise.resolve({ data, _url });
}

export default function request(url, { data, method }, other) {
  const _url = url;
  const options = {
    url,
    method,
    data,
    header: { [CONTENT_TYPE]: JSON_TYPE, Authorization: getToken() },
    ...other
  };
  switch (method.toUpperCase()) {
    case "GET":
    case "DELETE": {
      delete options.data;
      if (!data) {
        break;
      }
      const uri = (function(url, data) {
        let query = "?";
        for (const d in data) {
          if (data.hasOwnProperty(d)) {
            query += `${d}=${data[d]}&`;
          }
        }
        query.replace(/\&$/, "");
        return `${url}${query}`;
      })(url, data);
      options.url = uri;
      break;
    }
    case "POST":
    case "PUT":
    case "PATCH": {
      // TODO 这三种请求方式没做任何处理
      break;
    }
  }

  const VER = /^v\d\//;
  if (VER.test(options.url)) {
    options.url = options.url.replace(VER, "");
  }
  return new Promise((resolve, reject) => {
    showLoading(_url, true);
    options.url = `${baseURL}${options.url}`;
    wx.request({
      ...options,
      success: res => {
        resolve({ res, _url });
      },
      fail: err => {
        reject(err);
      }
    });
  })
    .then(checkStatus)
    .then(parseResponse)
    .catch(err => {
      showLoading();
      if (err.statusCode !== 401) {
        wx.showToast({
          title: err.data || "请求异常",
          icon: "none",
          complete: function() {
            console.log(`[${err.statusCode}]error: ${options.url}`);
          }
        });
      } else {
        // 401异常在这里处理
        if (errorTimer) {
          clearTimeout(errorTimer);
        }
        errorTimer = setTimeout(() => {
          notice({
            content: "抱歉! 您的权限不足, 登录后获取更多权限!",
            confirmText: "授权登录",
            msg: `[401]error: ${options.url}`
          });
          clearTimeout(errorTimer);
        }, 1000);
      }
      wx.getNetworkType({
        success(res) {
          if (res.networkType === "none") {
            wx.showToast({
              title: "断网了",
              icon: "none"
            });
          }
        }
      });
    });
}
const createMethod = method => (url, data, other) => {
  return request(url, { method, data }, other);
};
export const get = createMethod("get");
export const post = createMethod("post");
export const del = createMethod("delete");
export const put = createMethod("put");
