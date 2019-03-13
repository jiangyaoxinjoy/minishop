let App = getApp();
import { isEmpty,doAfterToken } from '../../utils/util';
import Toast from '../../res/vant/toast/toast';
Page({
  data: {
    goods_list: [], // 商品列表
    error_goods_list: [],
    order_total_price: 0,
    allCheckValue: false,
    gocheckout: false,
    result:[], //选择的商品id
    windowH:'',
    haveDataH:0,
    isNodata: false
  },
  onLoad: function (options) {
    wx.showLoading({
      title:'加载中'
    });
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          windowH: res.windowHeight - 50
        });
      }
    })
  },
  onShow: function () {
    this.setData({
      gocheckout:false
    })
    doAfterToken.call(App, this.getCartList);
  },
  /** 购物车列表 */
  getCartList: function () {
    const removeDuplicateItems = arr => [...new Set(arr)];
    var hxcheckList = removeDuplicateItems(wx.getStorageSync('hxcheckList') || []);
    var result = [],
      error_goods_list = [],
      goods_list = [];
  
    // console.log(hxcheckList)
    App.wxRequest.postRequest('cart/getlists').then( res => {
      var allgoodsList = res.data.data.goods_list || [];
   
      for (let i = 0, j = allgoodsList.length;i<j;i++) {
        let val = allgoodsList[i];
        if (val.goods_status == '10' && val.stock_num > 0) {
          goods_list.push(val)
          if (hxcheckList.indexOf(val.cart_id) !== -1) {
            result.push(parseInt(val.cart_id))
          }
        }else{
          error_goods_list.push(val)
        }
      }
      
      this.setData({ 
        goods_list, error_goods_list,result
      }, () => {
        wx.setStorageSync('hxcheckList', result)
        this.check_is_noData()
        this.ifAllCheck();
        this.computerPrice();
      });   
    }).catch(err => {
      wx.showModal({
        title: '温馨提示',
        content: err.errMsg,
      })
      // App.showError(err.errMsg);
    }).finally(() => {
      wx.hideLoading()
    })
  },
  check_is_noData: function() {
    // console.log(this.data.goods_list.length === 0 && this.data.error_goods_list.length === 0)
    if(this.data.goods_list.length === 0 && this.data.error_goods_list.length === 0) {
      this.setData({
        haveDataH:0,
        isNodata: true
      })
    }else{
      this.setData({
        haveDataH: this.data.windowH,
        isNodata: false
      })
    }
  },
  /**
   * 判断是否全选
   */
  ifAllCheck: function() {
    var canChooseLen = this.data.goods_list.length,
        chooseLen = this.data.result.length;
    if (chooseLen == canChooseLen && chooseLen !== 0) {
      this.setData({
        allCheckValue: true
      });
    }else{
      this.setData({
        allCheckValue: false
      });
    }
  },
  delGoods: function(e) {
    var type = 'goods';
    this.onCloseItem(e, type)
  },
  delErrorgoods: function(e) {
    var type = 'errorGoods'
    this.onCloseItem(e,type)
  },
  onCloseItem: function (e,type) {
    if (e.detail !='right'){
      return;
    }
    console.log(e.currentTarget.dataset);
    var cart_id = e.currentTarget.dataset.cart_id,
      idx = e.currentTarget.dataset.idx;
      
    wx.showModal({
      title: "提示",
      content: "您确定要移除当前商品吗?",
      success: (e) => {
        e.confirm && App.wxRequest.postRequest('cart/del', {
          cart_id: parseInt(cart_id),
        }).then(result => {
          console.log(result);
          if (result.data.code === 1) {
            if(type === 'goods') {
              var hxcheckList = wx.getStorageSync('hxcheckList');
              if(hxcheckList.indexOf(cart_id) !== -1) {
                hxcheckList.splice(hxcheckList.indexOf(cart_id), 1);
              }
            
              wx.setStorageSync('hxcheckList', hxcheckList);
              var goods_list = this.data.goods_list;
     
              goods_list.splice(idx, 1);
              this.setData({
                goods_list: goods_list,
                result: hxcheckList
              })
              this.getCartList();

              //把刚刚删除按钮的消去
              this.SwipeCellList = this.selectAllComponents(".vscell");
              this.SwipeCellList.forEach((value, index, array) => {
                this.SwipeCellList[index].close();
              });
            }else if(type === 'errorGoods') {
              var error_goods_list = this.data.error_goods_list;
              error_goods_list.splice(idx,1)
              this.setData({
                error_goods_list
              })
              this.SwipeCellList = this.selectAllComponents(".vscell");
              this.SwipeCellList.forEach((value, index, array) => {
                this.SwipeCellList[index].close();
              });
            }
          }
        }).catch(err =>{
          App.showError('删除购物车失败');
        })
      }
    });
  },

  onSubmit: function (e) {
    if (this.data.result.length == 0){
      App.showError('请选择要购买商品。');
      return;
    }
    this.setData({
      gocheckout: true
    })
    // 保留当前页面，跳转到应用内的某个页面。但是不能跳到 tabbar 页面。使用 wx.navigateBack 可以返回到原页面。
    wx.navigateTo({
      url: './checout?type=cart'
    })
  },
  
  /**
   * 全选
   */
  allCheckChange: function(e) {
    if(this.data.goods_list.length === 0) {
      return
    }
    var chooseLen = 0,
      goodsList = this.data.goods_list,
      result= [],
      totalPrice= 0,
      allCheckValue = this.data.allCheckValue;
      
    if (allCheckValue)   {
      this.setData({
        result:[],
        allCheckValue: false
      })
    }else{
      goodsList.forEach(val => {
        result.push(val.cart_id)
      })

      this.setData({
        result: result,
        allCheckValue: true
      })
    }
    wx.setStorageSync('hxcheckList', this.data.result);
    this.computerPrice();
  },
  onChange: function(e) {
    console.log(e);
    this.setData({
      result: e.detail
    })
    wx.setStorageSync('hxcheckList', e.detail);
    this.computerPrice()
    this.ifAllCheck();
  },
  computerPrice: function() {
    var caridArr = this.data.result,
        order_total_price = 0;
    this.data.goods_list.forEach(val => {
      if (caridArr.indexOf(val.cart_id) !== -1) {
        order_total_price = this.mathadd(order_total_price, val.goods_price, val.total_num);
      }
    })
    this.setData({
      order_total_price
    })
  },

  /**
   * 商品数量修改后提交后台
   * 如果有错误就重置购物车
   */
  updateCart: function (params) {
    App.wxRequest.postRequest('cart/update', params).then(res => {
      // console.log(res.data);
      if (res.data.code !== 1) {
        App.showError(res.data.msg);
        this.getCartList();
      }
    })
    .catch(err =>{
      App.showError(err);
      this.computerPrice();
    })
  },
  /**
   * 修改商品数量
   * index 商品序列号
   * num 修改后的数量
   * type plus和sub
   */
  onchangegoodsNum: function (index, num) {
    var goods = this.data.goods_list[index],
      goods_list = this.data.goods_list;
    goods_list[index].total_num = num;

    this.setData({
      goods_list: goods_list
    })
    this.computerPrice();
    var params = {
      cart_id: parseInt(goods.cart_id),
      goods_num: parseInt(num)
    };
    this.updateCart(params);
  },
  change_input: function (e) {
    console.log(isNaN(e.detail))
    if (isEmpty(e.detail) || isNaN(e.detail)) {
      console.log('222');
      Toast('请输入正确的商品数量~');
      this.onchangegoodsNum(e.currentTarget.dataset.id, 1);
    }
    if (Number(e.detail) > e.currentTarget.dataset.stock_num) {
      Toast('该商品不能添加更多了哦~');
      this.onchangegoodsNum(e.currentTarget.dataset.id, e.currentTarget.dataset.stock_num);
    }
    if (!isEmpty(e.detail) && Number(e.detail) <= e.currentTarget.dataset.stock_num) {
      this.onchangegoodsNum(e.currentTarget.dataset.id, e.detail);
    }  
  },

  mathadd: function (arg1, arg2, arg3) {
    return (Number(arg1) + Number(arg2) * Number(arg3)).toFixed(2);
  },
  // onplus: function (e) {
  //   this.onchangegoodsNum(e.currentTarget.dataset.id, e.detail, 'plus');
  // },
  // onsub: function (e) {
  //   this.onchangegoodsNum(e.currentTarget.dataset.id, e.detail, 'sub');
  // },
 
})