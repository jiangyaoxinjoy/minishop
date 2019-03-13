var App = getApp();
import { dateTimeFormatter} from '../../utils/util.js'

Page({
  data: {
    wxapp: null,
    // steps: [
    //   {
    //     text: '待支付',
    //     desc: '请及时支付'
    //   },
    //   {
    //     text: '待发货',
    //     desc: '后台配货中'
    //   },
    //   {
    //     text: '待收货',
    //     desc: '快递狂奔中'
    //   },
    //   {
    //     text: '已收货',
    //     desc: '享受宝物中'
    //   },{
    //     text: '交易已取消',
    //   },{
    //     text: '交易已完成',
    //   }
    // ],
    // active:0,
    id:null,
    detail: "",
    disabled: false,
    freight:'0.00'
  },

  onLoad: function (options) {
    // console.log(options)
    App.wxRequest.postRequest('my/orderdetail', { order_id: Number(options.id)}).then(res => {
      var data = res.data.data;
      data.createtime = dateTimeFormatter(data.createtime);
      var steps = this.data.steps;
      // steps.forEach((val,i) => {
      //   if (val.text === data.show_order_text) {
      //     this.setData({
      //       active:i
      //     })
      //   }
      // })
      
      this.setData({
        detail: data 
      })
    })
  },

  onShow: function () {
  },
  TapCancel: function () {
    let that = this;
    wx.showModal({
      title: "提示",
      content: "确认取消订单？",
      success: function (o) {
        if (o.confirm) {
          App._post('order/cancel', { 'id': that.data.id }, function (result) {
            wx.navigateBack();
          });
        }
      }
    });
  },
  onClicktjButton: function () {
    let that = this;
    if (that.data.disabled) {
      return false;
    }
    that.data.disabled = true;

    wx.showLoading({
      title: '正在处理...'
    });

    //如果是确认收货
    if (that.data.active==2){
      App._post('order/finish', { 'id': that.data.id }, function (result) {
        console.log('success');
        wx.redirectTo({
          url: './detail?id=' + that.data.id
        })
      }, function (result) {
        console.log(result);
      }, function () {
        that.data.disabled = false;
      });
      return;
    }

    App._post('order/order_pay', { 'id': that.data.id}, function (result) {
      console.log('success');
      //这里发起支付
      that.wx_pay_fun(result.data);
    }, function (result) {
      console.log(result);
    }, function () {
      that.data.disabled = false;
    });
  },
  wx_pay_fun: function (Rdata) {
    let that = this;
    // 发起微信支付
    wx.requestPayment({
      'timeStamp': Rdata.timestamp,
      'nonceStr': Rdata.nonceStr,
      'package': Rdata.package,
      'signType': Rdata.signType,
      'paySign': Rdata.paySign,
      success: function (res) {
        console.log('支付成功');
        // 跳转到订单展示界面
        wx.redirectTo({
          url: './detail?id='+that.data.id
        })
      },
      fail: function (res) {
        console.log(res);
        App.showError('订单未支付', function () {
          // 跳转到未付款订单展示界面

        });
      },
    });
  },
  goaftersale: function(e) {
    console.log(e)
    wx.navigateTo({
      url: './aftermarket?id=' + e.currentTarget.dataset.id,
    })
  },
  gorefund: function(e) {
    wx.navigateTo({
      url: './application?type=1&id=' + e.currentTarget.dataset.id,
    })
  },
  copyText: function (e) {
    console.log(e)
    wx.setClipboardData({
      data: e.currentTarget.dataset.text,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: '复制成功'
            })
          }
        })
      }
    })
  },
})