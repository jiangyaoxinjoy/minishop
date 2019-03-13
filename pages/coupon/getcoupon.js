let App = getApp();
import { formatDate} from '../../utils/util.js';
Page({
  data: {
    coupon:[]
  },
  onLoad: function (options) {
    App.wxRequest.getRequest('index/coupon').then(res => {
      if (res.data.code === 1) {
        var packetList = res.data.data;
        var hxcouponList = wx.getStorageSync('hxcouponList') || [];
        packetList.forEach(val => {
          if (hxcouponList.indexOf(val.id) != -1) {
            val.coupontext = ['已', '领', '取'];
            val.ifget = true;
            val.time = formatDate(val.expiredtime);
          } else {
            val.coupontext = ['立', '即','领', '取'];
            val.ifget = false;
            val.time = formatDate(val.expiredtime);
          }
        })
        // console.log(packetList);
        this.setData({
          coupon: packetList
        })
      }
    })
  },
  getCoupon: function (e) {
    var id = e.currentTarget.dataset.id,
        hxcouponList = wx.getStorageSync('hxcouponList') || [],
        index = e.currentTarget.dataset.item;

    App.wxRequest.postRequest('coupon/get', {
      coupon_id: Number(id),
    }).then(res => {
      console.log(res.data);
      if (res.data.code == 1 && !this.data.coupon[index].ifget) {
        wx.showToast({
          title: "领取成功",
          icon: 'success',
          success: () => {
            if (hxcouponList.indexOf(id) == -1) {
              hxcouponList.push(id);
              wx.setStorageSync('hxcouponList', hxcouponList);
              this.getcouponcb.call(this, index);
            }
          }
        });
      } else if (res.data.code == 0) {
        App.showError('领取失败')
      }
    })
  },
  getcouponcb: function (index) {
    var coupon = this.data.coupon;
    var val = coupon[index];
    console.log(index);
    val.coupontext = ['已', '领', '取'];
    val.ifget = true;
    coupon[index] = val;
    this.setData({
      coupon
    })
  },
})