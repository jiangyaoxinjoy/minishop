var Promise = require('../plugins/es6-promise.js');
var Domain = "http://192.168.1.44:8080/";

function wxPromisify(fn) {
  // wx.showNavigationBarLoading();
  return function (obj = {}) {
    return new Promise((resolve, reject) => {
      obj.success = function (res) {
        //成功
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res);
        } else {
          // FetchError(res.data);
          reject(res.data)
        }
      }
      obj.fail = function (res) {
        // console.log(res);
        //失败
        // FetchError(res);
        reject(res)
      }
      fn(obj)
    })
  }
}
//无论promise对象最后状态如何都会执行
Promise.prototype.finally = function (callback) {
  let P = this.constructor;
  return this.then(
    value => P.resolve(callback()).then(() => value),
    reason => P.resolve(callback()).then(() => { throw reason })
  );
};
/**
 * 微信请求get方法
 * url
 * data 以对象的格式传入
 */
function getRequest(url, data) {
  data = data || {};
  data.token = wx.getStorageSync('token');
  var getRequest = wxPromisify(wx.request)
  return getRequest({
    url: Domain + url,
    method: 'GET',
    data: data,
    header: {
      'Content-Type': 'application/json'
    },
    // success: FetchSuccess,
    // fail: FetchError,
    // complete: RequestOver
  })
}

/**
 * 微信请求post方法封装
 * url
 * data 以对象的格式传入
 */
function postRequest(url, data) {
  data = data || {};
  data.token = wx.getStorageSync('token');
  var postRequest = wxPromisify(wx.request)
  return postRequest({
    url: Domain + url,
    method: 'POST',
    data: data,
    header: {
      'Content-Type': 'application/json'
    },
    // success: FetchSuccess,
    // fail: FetchError,
    // complete: RequestOver
  })
}

/**
     * 成功回调
     */
function FetchSuccess(res) {
  console.log(res)
  if (res.statusCode >= 200 && res.statusCode < 300) {
    resolve(res);
  } else {
    FetchError(res.data);
    // switch (res.statusCode) {
    //   case 403:
    //     // 业务逻辑处理
    //     break
    // }
  }
}

 /**
 * 异常处理
 */
function FetchError(err) {
  if (err) {
    console.log(err);
    wx.showToast({
      title: err.errMsg,
      icon: 'none',
      mask: true,
      duration:10000
    })
  }
}

function RequestOver() {
  // wx.hideLoading();
  // wx.hideNavigationBarLoading();
  // wx.showToast({
  //   title: '请求成功',
  //   icon: 'none',
  //   duration: 3000
  // })
}

module.exports = {
  postRequest: postRequest,
  getRequest: getRequest
}