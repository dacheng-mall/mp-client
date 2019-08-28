const formatTime = date => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return (
    [year, month, day].map(formatNumber).join("/") +
    " " +
    [hour, minute, second].map(formatNumber).join(":")
  );
};

const formatNumber = n => {
  n = n.toString();
  return n[1] ? n : "0" + n;
};

const mockFetch = (data, delay = 1000) => {
  return new Promise(res => {
    const timer = setTimeout(() => {
      res(data);
      clearTimeout(timer);
    }, delay);
  });
};

const uri = (url, query = {}, startWithLine) =>
  (function(q) {
    let res = "";
    for (let key in q) {
      res += `${key}=${q[key]}&`;
    }
    if (res !== "") {
      res = res.replace(/&$/, "");
      res = `?${res}`;
    }
    if (startWithLine && !/^\//.test(url)) {
      return `/${url}${res}`;
    }
    return `${url}${res}`;
  })(query);
const parseQuery = query => {
  const _q = query.replace(/^\?/, "");
  const res = {};
  _q.split("&").map(item => {
    const [key, value] = item.split("=");
    res[key] = value;
  });
  return res;
};
function getRoute() {
  let pages = getCurrentPages(); //获取加载的页面
  let currentPage = pages[pages.length - 1]; //获取当前页面的对象
  let url = currentPage.route; //当前页面url
  let options = currentPage.options; //如果要获取url中所带的参数可以查看options

  //拼接url的参数
  let urlWithArgs = url + "?";
  for (let key in options) {
    let value = options[key];
    urlWithArgs += key + "=" + value + "&";
  }
  urlWithArgs = urlWithArgs.substring(0, urlWithArgs.length - 1);

  return {
    path: urlWithArgs,
    url,
    options,
    length: pages.length
  };
}
function validateMobile(string, msg = "无效手机号") {
  const reg = /^1(3|4|5|7|8)\d{9}$/;
  if (!reg.test(string)) {
    return msg;
  }
  return false;
}
function validateCarLisence(string, msg = "无效车牌号") {
  const reg = /([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}(([0-9]{5}[DF])|(DF[0-9]{4})))|([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9挂学警港澳]{1})$/;
  if (!reg.test(string)) {
    return msg;
  }
  return false;
}
function validateIdcard(string, msg = "无效身份证号") {
  const reg = /(^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$)|(^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}$)/;
  if (!reg.test(string)) {
    return msg;
  }
  return false;
}
function validateName(string, msg = "名字的长度不得超过18个字") {
  if (string.trim().length > 18) {
    return msg;
  }
  return false;
}

function getContHeight() {
  try {
    const sysInfo = wx.getSystemInfoSync();
    let headerPosi = wx.getMenuButtonBoundingClientRect(); // 胶囊位置信息
    return (
      sysInfo.screenHeight -
      (2 * headerPosi.bottom - headerPosi.height - sysInfo.statusBarHeight)
    );
  } catch (e) {
    console.log(e);
  }
}
module.exports = {
  mockFetch,
  formatTime,
  uri,
  parseQuery,
  validateMobile,
  validateCarLisence,
  validateIdcard,
  validateName,
  getRoute,
  getContHeight
};
