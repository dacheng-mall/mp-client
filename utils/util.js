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

module.exports = {
  mockFetch,
  formatTime,
  uri
};
