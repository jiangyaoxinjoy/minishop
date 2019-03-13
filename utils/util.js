const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatDate = expiredtime => {
  if (expiredtime.length == 10) {
    expiredtime = expiredtime * 1000;
  } else {
    expiredtime = expiredtime;
  }
  var a = new Date(expiredtime * 1000);
  return a.getFullYear() + "-" + a.getMonth() + "-" + a.getDate();
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function urlencode(data) {
  var _result = [];
  for (var key in data) {
    var value = data[key];
    if (value.constructor == Array) {
      value.forEach(function (_value) {
        _result.push(key + "=" + _value);
      });
    } else {
      _result.push(key + '=' + value);
    }
  }
  return _result.join('&');
}

function json2Form(json) {
  var str = [];
  for (var p in json) {
    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(json[p]));
  }
  return str.join("&");
}

function isEmpty(obj) {
  if (typeof obj == "undefined" || obj == null || obj == "") {
    return true;
  } else {
    return false;
  }
}

function doAfterToken(...cb) {
  var token = wx.getStorageSync('token');
  if (!isEmpty(token)) {
    cb.forEach(val => {
      val();
    })
  } else {
    this.doAfterToken = () => {
      cb.forEach(val => {
        val();
      })
    }
  }
}

function checkAddZone(num) {
  return num < 10 ? '0' + num.toString() : num
}

function dateTimeFormatter(t) {
  if (!t) return ''
  t = new Date(t).getTime()
  t = new Date(t)
  var year = t.getFullYear()
  var month = (t.getMonth() + 1)
  month = checkAddZone(month)
  var date = t.getDate()
  date = checkAddZone(date)

  var hour = t.getHours()
  hour = checkAddZone(hour)

  var min = t.getMinutes()
  min = checkAddZone(min)

  var se = t.getSeconds()
  se = checkAddZone(se)

  return year + '-' + month + '-' + date + ' ' + hour + ':' + min + ':' + se
}

let getQueryString = function (url, name) {
  console.log("url = " + url)
  console.log("name = " + name)
  var reg = new RegExp('(^|&|/?)' + name + '=([^&|/?]*)(&|/?|$)', 'i')
  var r = url.substr(1).match(reg)
  if (r != null) {
    console.log("r = " + r)
    console.log("r[2] = " + r[2])
    return r[2]
  }
  return null;
}

//删除数组元素
const deletArray = function (array, index) {
  let temp = [];
  array.forEach((element, idx) => {
    if (idx != index) {
      temp.push(element);
    }
  });
  return temp;
}

module.exports = {
  formatTime: formatTime,
  urlencode:urlencode,
  json2Form: json2Form,
  isEmpty: isEmpty,
  doAfterToken: doAfterToken,
  formatDate: formatDate,
  dateTimeFormatter: dateTimeFormatter,
  getQueryString: getQueryString,
  deletArray: deletArray
}