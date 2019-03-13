let App = getApp();
import { doAfterToken, formatDate } from '../../utils/util';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    expired: [],
    unused: [],
    used:[],
    isNoData: false
  },

  onLoad: function (options) {
    doAfterToken.call(App, this.getlists);
  },
  getlists: function() {
    App.wxRequest.postRequest('coupon/getlists').then( res => {     
      if (res.data.code == 1) {
        console.log(res.data.data);
        var unused = res.data.data.unused;
        unused.forEach((val,i) => {
          val.time = formatDate(val.expiredtime);
        });
        var used = res.data.data.used;
        used.forEach((val, i) => {
          val.time = formatDate(val.expiredtime);
        });
        var expired = res.data.data.expired;
        expired.forEach((val, i) => {
          val.time = formatDate(val.expiredtime);
        });
        this.setData({
          unused,
          used,
          expired
        })
      }
    })
  },
})