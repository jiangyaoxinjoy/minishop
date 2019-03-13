var Promise = require('../plugins/es6-promise.js')

function wxPromisify(fn) {
  // console.log(fn)
  return function (obj = {}) {
    return new Promise((resolve, reject) => {
      obj.success = function (res) {
        //成功
        resolve(res)
      }
      obj.fail = function (res) {
        //失败
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

// 获取图片基本信息
export function wxGetImgInfo(imgUrl) {
  return new Promise(async function (resolve, reject) {
    wx.getImageInfo({
      src: imgUrl,
      success: function (res) {
        resolve(res);
      },
      fail: function (err) {
        reject(err);
      }
    })
  });
}

// 下载文件
export function wxDownloadFile(fileUrl) {
  return new Promise(async function (resolve, reject) {
    wx.downloadFile({
      url: fileUrl,
      success: function (res) {
        resolve(res);
      },
      fail: function (err) {
        reject(err);
      }
    })
  });
}

// 获取设备基本信息
export function wxGetSystemInfo() {
  return new Promise(async function (resolve, reject) {
    wx.getSystemInfo({
      success: function (res) {
        resolve(res);
      },
      fail: function (err) {
        reject(err);
      }
    })
  });
}

// canvas画布转图片
function wxCanvasToTempFilePath(canvasObj) {
  return new Promise(async function (resolve, reject) {
    wx.canvasToTempFilePath({
      x: canvasObj.x,
      y: canvasObj.y,
      width: canvasObj.width,
      height: canvasObj.height,
      destWidth: canvasObj.destWidth,
      destHeight: canvasObj.destHeight,
      canvasId: canvasObj.canvasId,
      fileType: canvasObj.fileType ? canvasObj.fileType : 'png',
      success: function (res) {
        resolve(res);
      },
      fail: function (err) {
        reject(err);
      }
    })
  });
}

// 保存图片到本地
function wxSaveImageToPhotosAlbum(filePath) {
  // return wxPromisify(wx.saveImageToPhotosAlbum(filePath))
  // return new Promise(async function (resolve, reject) {
 
  // });
  return new Promise((resolve,reject) => {
      wx.saveImageToPhotosAlbum({
        filePath: filePath,
        success: function (res) {
          console.log(res)
          resolve(res);
        },
        fail: function (err) {
          reject(err);
        }
      })
    })
}

module.exports = {
  wxSaveImageToPhotosAlbum: wxSaveImageToPhotosAlbum,
  wxCanvasToTempFilePath: wxCanvasToTempFilePath,
  wxGetSystemInfo: wxGetSystemInfo,
  wxDownloadFile: wxDownloadFile,
  wxGetImgInfo: wxGetImgInfo
}