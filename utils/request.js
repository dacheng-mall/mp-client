import { apiUrl, pcApiUrl, aliApiUrl } from "../setting.js";

const CONTENT_TYPE = "Content-Type";
const JSON_TYPE = "application/json";
const baseURL = aliApiUrl;
let token = "";
export function setToken(t) {
  if (t === "") {
    token = t;
    wx.removeStorageSync("token");
    return;
  }
  token = `Bearer ${t}`;
  wx.setStorageSync("token", token);
}
function getToken() {
  if (token) {
    return token;
  }
  return wx.getStorageSync("token");
}

export function getType(res) {
  return res.headers.get(CONTENT_TYPE);
}

export function parseResponse(data) {
  // TODO 这里只处理了json类型的返回值, 如果有其他类型的需要再扩展
  wx.hideLoading()
  return Promise.resolve(data);
}
export function checkStatus(res) {
  const { statusCode, data } = res;
  if (statusCode !== 200) {
    return Promise.reject(`请求失败(code:${statusCode}) ${data}`);
  }
  return Promise.resolve(data);
}

export default function request(url, { data, method }, other) {
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
  if(VER.test(options.url)) {
    options.url = options.url.replace(VER, '');
  }

  return new Promise((resolve, reject) => {
    options.url = `${baseURL}${options.url}`;
    wx.showLoading({
      title: '加载中...'
    })
    wx.request({
      ...options,
      success: res => {
        resolve(res);
      },
      fail: err => {
        reject(err);
      }
    });
  })
    .then(checkStatus)
    .then(parseResponse)
    .catch(err => {
      wx.getNetworkType({
        success(res){
          if(res.networkType === 'none') {
            wx.showToast({
              title: '断网了',
              icon: 'none'
            })
          }
        }
      })
    });
}
const createMethod = method => (url, data, other) => {
  return request(url, { method, data }, other);
};
export const get = createMethod("get");
export const post = createMethod("post");
export const del = createMethod("delete");
export const put = createMethod("put");
