let App = getApp();
import { doAfterToken } from '../../utils/util';
// import Dialog from '../../res/vant/dialog/dialog';
Page({

  data: {
    orderList: [],
    active:0,
    isNoData:false,
    cancel_dialog_show: false,
    cancel_id:-1
  },
  onLoad: function (options) {
    if (options.showType){
      this.setData({
        active: options.showType
      });
    }
    doAfterToken.call(App, this.getorderlists);
  },
  getorderlists: function() {
    App.wxRequest.postRequest('my/orderlists').then(res => {
      console.log(res.data);
      var data = res.data.data;
      data.forEach(val =>{
        val.goods_list.forEach(vall => {
          vall.goods_coupon_price = (vall.total_coupon_price / vall.total_num).toFixed(2);
        })
      })
      this.setData({
        orderList: data.reverse()
      },() => {
        this.check_is_noData();
      })
      
    })
  },
  onShow: function () {
   
  },
  goDetail: function(e) {
    wx.navigateTo({
      url: './detail?id=' + e.currentTarget.dataset.id
    })
  },
  onChangeTab: function (e) {
    // console.log(e);
    this.setData({
      active: e.detail.index
    });
    this.check_is_noData();
  },
  check_is_noData: function () {
    var type= ['全部订单','待支付','待发货','待收货'];
    var isnodata = true,
      orderList = this.data.orderList;
    if (this.data.active == 0) {
      if (orderList.length !== 0){
        isnodata = false
      }
    }else{
      var flag = orderList.some(val => {
        return val.show_order_text == type[this.data.active];
      })
      if (flag) {
        isnodata = false
      }
    }
    this.setData({
      isNoData: isnodata
    });
  },
  cancel_order: function(e) {
    var id = e.currentTarget.id;
  
    this.setData({
      cancel_dialog_show: true,
      cancel_id: id 
    })
  },
  confirm_delete: function() {
    // console.log(22)
    App.wxRequest.postRequest('order/cancel', { order_id: parseInt(this.data.cancel_id)}).then(res =>{
      console.log(res.data)
      if(res.data.code === 0) {
        console.log('err')
        App.showError(res.data.msg)
      }
      if(res.data.code === 1) {
        App.showSuccess('删除成功');
        var order_list = this.data.orderList.concat();
        var new_order_list = [];
        order_list.forEach(val =>{
          if (val.id != this.data.cancel_id) {
            new_order_list.push(val)
          }
        })
        this.setData({
          orderList: new_order_list
        })
      }
    })
  }
 }) 