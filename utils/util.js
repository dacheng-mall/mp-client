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

const uri = (url, query = {}) => (function(q){
  let res = ''
  for(let key in q) {
    res += `${key}=${q[key]}&`
  }
  if(res !== '') {
    res = res.replace(/&$/, '');
    res = `?${res}`;
  }
  return `${url}${res}`
}(query));
function getRoute(){
  var pages = getCurrentPages()    //获取加载的页面
  var currentPage = pages[pages.length-1]    //获取当前页面的对象
  var url = currentPage.route    //当前页面url
  var options = currentPage.options    //如果要获取url中所带的参数可以查看options
  
  //拼接url的参数
  var urlWithArgs = url + '?'
  for(var key in options){
      var value = options[key]
      urlWithArgs += key + '=' + value + '&'
  }
  urlWithArgs = urlWithArgs.substring(0, urlWithArgs.length-1)
  
  return {
    path: urlWithArgs,
    url,
    options,
    length: pages.length
  }
}
module.exports = {
  mockFetch,
  formatTime,
  uri,
  getRoute
};
