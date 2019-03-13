let App = getApp();
import { isEmpty, doAfterToken } from '../../utils/util';
Page({

  data: {
    // wxapp: [],
    fromtype:null,
    goods_list: [], // 商品列表
    order_total_num: 0,
    express_price:0, //快递费
    c_order_total_price: 0, //优惠后的价格
    order_total_price:0, // 总价
    disabled: false, //是否禁用提交按钮
    from_options:[], 
    address:"",
    address_id: -1,
    ifregetAddress: false,
    // coupon:[],
    couponshow:false,
    cash_coupon_num: 0, //可用现金券张数
    discount_coupon_num: 0,//可用优惠券张数
    discount_coupon_list:[], 
    cash_coupon_list:[],
    coupon_detail: [],
    coupon_type:'cash',
    coupon_detail_id: 0,
    cash_coupon_checked:'',
    discount_coupon_checked:'',
  },

  onLoad: function (options) {
    wx.showLoading({
      title:'加载中'
    })
    console.log(options)
    this.setData({
      fromtype: options.type,
      from_options: options
    },() =>{
      doAfterToken.call(App, this.getGoods,this.getDefaultAdd);
    });
  },
  getGoods: function() {
    if (this.data.fromtype == 'cart') {
      var order_total_price = 0,
          order_total_num = 0,
          cartids = [],
          goods_list = [],
          hxcheckList = wx.getStorageSync('hxcheckList');

      App.wxRequest.postRequest('cart/getlists').then(result => {
        result.data.data.goods_list.forEach(item => {
          if (hxcheckList.indexOf(item.cart_id) != -1) {
            goods_list.push(item);
            order_total_num += Number(item.total_num);
            order_total_price = this.mathadd(order_total_price, item.goods_price, item.total_num);
          }
        })
        this.setData({
          goods_list,
          order_total_price,
          order_total_num,
          ifregetAddress: true
        });
        this.getcouponlists();
      })
    }
    if (this.data.fromtype == 'buyNow') {
      App.wxRequest.postRequest('goods/detail', {
        goods_id: Number(this.data.from_options.goods_id)
      }).then(res => {
        console.log(res.data.data)
        var data = res.data.data,
            spec_list = data.spec_data.spec_list || [],
            goods,
            goods_list = [],
            sku_id = this.data.from_options.goods_sku_id,
            sku_id_arr = this.data.from_options.goods_sku_id.split('_'),
            goods_attr = "",
            goods_sku = {},
            total_price = 0;

        if (spec_list.length == 0) {
          goods = data.detail.spec[0];  
          console.log(this.data.from_options.goods_num)
          goods.total_num = this.data.from_options.goods_num;
          total_price = this.mathadd(0, goods.goods_price, goods.total_num)
        }else{
          data.detail.spec.forEach(val => {
            if (val.spec_sku_id == sku_id) {
              goods = val;
              goods.total_num = this.data.from_options.goods_num;
              total_price = this.mathadd(0, goods.goods_price, goods.total_num)
            }
          })
          data.spec_data.spec_attr.forEach(item => {
            item.spec_items.forEach(subitem => {
              if (sku_id_arr.indexOf(String(subitem.item_id)) != -1) {
                goods_attr += subitem.spec_value + ';'
              }
            })
          })  
        }
        goods_sku.goods_attr = goods_attr;
        goods_sku.spec_image = goods.spec_image;
        goods.goods_sku = goods_sku;
        goods.image = data.detail.imgs_url[0];
        goods.goods_name = data.detail.goods_name;
        goods_list.push(goods)
       
        this.setData({
          goods_list,
          order_total_price: total_price,
          order_total_num: this.data.from_options.goods_num,
          ifregetAddress: true
        })
        this.getcouponlists();
        this.getPrice();
      })
    }   
  },
  onShow: function () { 
    if (this.data.ifregetAddress && this.data.address_id != -1) {
      App.wxRequest.postRequest('address/get', { address_id: Number(this.data.address_id) }).then(res => {
        console.log(res.data);
        var add = res.data.data;
        if (add.address_id != 0) {
          this.setData({
            address: res.data.data,
          })
        } else {
          this.getDefaultAdd();
        }
      })
      .catch(err => {
        App.showError('获取地址失败')
      })
    }
    if (this.data.ifregetAddress && this.data.address_id == -1){
      this.getDefaultAdd()
    }   
  },
  getDefaultAdd:function() {
    App.wxRequest.postRequest('address/getdefault').then(res => {
      var data = res.data.Data;
      if(res.data.code == 2) {
       
      }else if(res.data.code == 1){
        this.setData({
          address: data,
          address_id: data.address_id,
        })
      }
    }).catch(err => {
      App.showError('获取地址失败')
    }) 
  },
  getcouponlists: function () {
    App.wxRequest.postRequest('coupon/getcurrlists').then(res => {
      console.log(res.data.data);
      var discount_coupon_list= [],
        cash_coupon_list= [],
        allcoupon = res.data.data || [],
        // allcoupon = [],
        order_total_price = this.data.order_total_price,
        cash_coupon_checked = {},
        discount_coupon_checked={};

      console.log(allcoupon.length)
      if (allcoupon.length === 0) {
        this.setData({
          cash_coupon_num:0,
          discount_coupon_num:0
        })
        this.getPrice()
      }else{
        allcoupon.forEach(val => {
          var key = val.name,
            requirement = val.requirement;
          if(key.indexOf('现金券') !== -1) {
            cash_coupon_list.push(val)
          }else{
            if (parseInt(requirement) < parseInt(order_total_price)) {
              discount_coupon_list.push(val);
            } 
          }
        })

        var cash_coupon_checked = cash_coupon_list.sort(function (a, b) {
          return b.discount - a.discount;
        })[0] || {};

        var discount_coupon_checked = discount_coupon_list.sort(function (a, b) {
          return b.discount - a.discount;
        })[0] || {};

        // console.log(cash_coupon_checked)
        if (this.data.goods_list.length != 0) {
          cash_coupon_list.push({ id: -1, name: "不使用现金券", discount: 0 });
          discount_coupon_list.push({ id: -1, name: "不使用优惠券", discount: 0 });
          this.setData({
            discount_coupon_list: discount_coupon_list,
            cash_coupon_list: cash_coupon_list,
            cash_coupon_num: cash_coupon_list.length - 1,
            discount_coupon_num: discount_coupon_list.length - 1,
            cash_coupon_checked,
            discount_coupon_checked
          },() => {
            // console.log(333)
            this.getPrice()
          })
        }else{
          App.showError('请重新选择商品',() =>{
            wx.navigateBack()
          })
        }   
      }
    }).catch(err =>{
      // console.log(err)
      // App.showError(err.msg)
    }).finally( () =>{
      wx.hideLoading()
    })
  },
  TapAdress: function () {
    wx.navigateTo({
      url: '../adress/index'
    });
  },
  // 提交订单
  onClicktjButton: function () {
    if (this.data.goods_list.length==0) {
      App.showError('此订单无商品');
      return false;
    }

    if (this.data.disabled) {
      return false;
    }

    this.setData({
      disabled:true
    })
    if (this.data.fromtype=='cart'){
      if (parseFloat(this.data.c_order_total_price) === 0) {
        App.showSuccess('支付成功');
      }else{
        wx.showLoading({
          title: '正在处理...'
        });
        var params = {
          cart_ids: wx.getStorageSync('hxcheckList'),
          coupon_condition: (this.data.discount_coupon_checked.coupon_id == -1 ? '' : this.data.discount_coupon_checked.coupon_id) || '',
          coupon_cash: (this.data.cash_coupon_checked.coupon_id == -1 ? '' : this.data.cash_coupon_checked.coupon_id) || '',
          address_id: parseInt(this.data.address.address_id),
          total_price: parseFloat(this.data.c_order_total_price)
        }
        // console.log(params)
        App.wxRequest.postRequest('order/cart_pay', params).then(res => {
          console.log(res);
          if (res.data.code === 0) {
            App.showError(res.data.msg, () => {
              wx.navigateBack()
            })
          } else {

          }
        }).catch((err) =>{
          App.showError(err.errMsg, () => {
            wx.navigateBack()
          })
        })       
        .finally(() => {
          wx.hideLoading()
        })
      }
    }
    if (this.data.fromtype == 'buyNow') {
      var goods = this.data.goods_list[0]
      var order_list = {
        goods_id: parseInt(goods.goods_id), 
        goods_num: parseInt(this.data.order_total_num), 
        goods_sku_id: this.data.from_options.goods_sku_id || "0"
      }
      var params = {
        order_list: order_list,
        coupon_condition: (this.data.discount_coupon_checked.coupon_id == -1 ? '' : this.data.discount_coupon_checked.coupon_id) || '',
        coupon_cash: (this.data.cash_coupon_checked.coupon_id == -1 ? '' : this.data.cash_coupon_checked.coupon_id) || '',
        address_id: parseInt(this.data.address.address_id),
        total_price: parseFloat(this.data.c_order_total_price)
      }
      App.wxRequest.postRequest('order/buyNow_pay', params).then(res => {
        console.log(res);
        if(res.data.code == 0) {
          App.showError(res.data.msg, () => {
            wx.navigateBack()
          })
        }
      }).catch(err => {
        App.showError(err.errMsg, () => {
          wx.navigateBack()
        })
      })
     
    }
  },

  wx_pay_fun: function (Rdata){
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
          url: '../order/index?showType=2'
        })
      },
      fail: function (res) {
        console.log(res);
        App.showError('订单未支付', function () {
          // 跳转到未付款订单展示界面
          wx.redirectTo({
            url: '../order/index?showType=1'
          })
        });
      },
    });
  },
  mathadd: function (arg1, arg2, arg3) {
    return (Number(arg1) + Number(arg2) * Number(arg3)).toFixed(2);
  },
  addAdress: function() {
    wx.navigateTo({
      url: '../adress/create?setDefault=1'
    });
  },
  choosecoupon: function(e) {
    // couponshow
    // console.log(e.currentTarget.dataset.type)
    if (e.currentTarget.dataset.type === 'cash') {
      if (this.data.cash_coupon_num === 0) {
        return;
      }
      var id = isEmpty(this.data.cash_coupon_checked) ? 0 : this.data.cash_coupon_checked.id;
      this.setData({
        coupon_type:'cash',
        coupon_detail: this.data.cash_coupon_list,
        coupon_detail_id: id
      })

    } else if (e.currentTarget.dataset.type === 'discount') {
      if (this.data.discount_coupon_num === 0) {
        return;
      }
      var id = this.data.discount_coupon_checked == '' ? 0 : this.data.discount_coupon_checked.id;
      this.setData({
        coupon_type:'discount',
        coupon_detail: this.data.discount_coupon_list,
        coupon_detail_id: id
      })
    }
    this.setData({
      couponshow:true
    })
  },
  onChange: function(e) {
    this.setData({
      coupon_detail_id: parseInt(e.detail)
    })
  },
  selectcoupon: function() {
    var cash_coupon_checked, discount_coupon_checked;
    if (this.data.coupon_type === 'discount'){
      this.data.coupon_detail.forEach(val => {
        if (val.id === this.data.coupon_detail_id) {
          discount_coupon_checked = val
        }
      })
      this.setData({
        discount_coupon_checked,
        couponshow: false
      }, () => {
        this.getPrice()
      })   
    } else if (this.data.coupon_type === 'cash') {
      this.data.coupon_detail.forEach(val => {
        if (val.id === this.data.coupon_detail_id) {
          cash_coupon_checked = val
        } 
      })
      this.setData({
        cash_coupon_checked,
        couponshow: false
      },() => {
        this.getPrice()
      })   
    }
  },
  getPrice: function() {
    var arg1 = Number(this.data.order_total_price),
        arg2 =0,
        arg3 =0;
  
    if (this.data.cash_coupon_checked.discount !== undefined) {
      arg2 = this.data.cash_coupon_checked.discount
    }
    if (this.data.discount_coupon_checked.discount !== undefined)  {
      arg3 = this.data.discount_coupon_checked.discount;
    }
    var c_order_total_price = this.mathminus(arg1, arg2, arg3)
    this.setData({
      c_order_total_price: c_order_total_price >= 0 ? c_order_total_price : 0
    })
  },
  onClose: function(e) {
    this.setData({
      couponshow: false
    })
  },
  onClick: function(e) {
    console.log(e.currentTarget.dataset.name);
    this.setData({
      coupon_detail_id: parseInt(e.currentTarget.dataset.name)
    })
  },
  mathminus: function (arg1, arg2, arg3) {
    return (Number(arg1) - Number(arg2) - Number(arg3)).toFixed(2);
  },
})