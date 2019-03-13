// 可以获取到小程序实例
let App = getApp();
import { isEmpty, doAfterToken} from '../../utils/util';
Page({
  data: {
    // banner轮播组件属性
    indicatorDots: true, // 是否显示面板指示点	
    autoplay: true, // 是否自动切换
    interval: 3000, // 自动切换时间间隔
    duration: 800, // 滑动动画时长
    wxapp:[],
    newlist:[],
    randomlist: [],
    banner:[],
    coupon:[],
    re_value: '',
  },    
  onLoad: function (options) {
    wx.showNavigationBarLoading();
    wx.showLoading({
      title:'加载中'
    });
    this.getIndex();
  },

  onShow: function () {
    doAfterToken.call(App, this.setCoupon);
  },
  
  setCoupon: function() {
    App.wxRequest.getRequest('index/coupon').then(res => {
      if (res.data.code === 1) {
        var packetList = res.data.data,
          hxcouponList = wx.getStorageSync('hxcouponList') || [],
          newArr = [];
        packetList.forEach(val => {
          if (hxcouponList.indexOf(val.id) != -1) {
            val.coupontext = ['已', '领', '取'];
            val.ifget = true;
            newArr.push(val.id)
          } else {
            val.coupontext = ['领', '取'];
            val.ifget = false;
          }
        })
        // console.log(newArr)
        wx.setStorageSync('hxcouponList', newArr); //重新赋值删掉多余的数据
        this.setData({
          coupon: packetList
        })
      }
    })
    
  },
  getIndex: function() {
    App.wxRequest.getRequest('index/index').then(res => {
      if(res.data.data.code === 1) {
        let result = res.data.data;
        // console.log(result)
        this.setData({
          newlist: result.NewList,
          randomlist: result.Randomlist,
          banner: result.bannerlist,
          index_notice: result.content
        });
      }
    }).catch(err => {
      App.showError(err.errMsg);
    }).finally(() =>{
      wx.hideNavigationBarLoading();
      wx.hideLoading();
    })
  },
  getCoupon: function(e) {
    var id = e.currentTarget.dataset.id,
        hxcouponList = wx.getStorageSync('hxcouponList') || [],
        index = e.currentTarget.dataset.item;

    App.wxRequest.postRequest('coupon/get',{
      coupon_id: Number(id),
    }).then(res => {
      console.log(res.data)
      if (res.data.code == 1) {
        if(!this.data.coupon[index].ifget) {
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
        }
      } else if (res.data.code == 0) {
        App.showError('领取失败')
      }
    }).catch(err => {
      App.showError(err)
    })
  },
  getcouponcb: function (index) {
    var coupon = this.data.coupon;
    var val = coupon[index];
    // console.log(index);
    val.coupontext = ['已', '领', '取'];  
    val.ifget = true;
    coupon[index] = val;
    this.setData({
      coupon
    })
  },
  // onChange: function (event) {
  //   this.setData({
  //     active: event.detail
  //   })
  // },
  // 修改关键词
  onSearchchange: function (event) {
    this.setData({
      re_value: event.detail
    })
  },
  onSearch: function (event) {
    // console.log(isEmpty);
    //这里跳转到  搜索页
    if (isEmpty(this.data.re_value)) {
      wx.showToast({
        title: '请输入关键字',
        icon: 'none'
      })
    }
    if (!isEmpty(this.data.re_value)){
      wx.navigateTo({
        url: '../category/list?rename=1&name=' + this.data.re_value
      })
    }   
  },
  onPullDownRefresh: function() {
  　wx.showNavigationBarLoading(); 
    // this.setwxTitle();
    this.getIndex();
    this.setCoupon();
    setTimeout(() => {
      wx.hideNavigationBarLoading();  
    },1000);
    wx.stopPullDownRefresh();
  },
  onShareAppMessage: function () {
    var affid = wx.getStorageSync('affid');
    return {
      title: "小程序商城",
      desc: "",
      path: "/pages/index/index?affid="+affid
    };
  },   
})