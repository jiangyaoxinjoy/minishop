let App = getApp();
import { isEmpty } from '../../utils/util';
Page({

  data: {
    scrollHeight: null,
    list: [],
    storeList:[],
    last_page:null,
    noList: false,
    // no_more: false,
    sel_type:"normal",
    c_id: -1,//-1为 搜索名字
    title:'',
    down: true,
    ifPriceActive: false
  },

  onLoad: function (options) {
    wx.showLoading()
    this.setData({
      c_id: options.cid || -1,
      title:options.name,
      is_rename: options.rename == 1
    },() =>{
      this.initList();
    });
  },
  initList: function() {
    wx.setNavigationBarTitle({
      title: this.data.title || '所有商品'
    })
    // 设置商品列表高度
    this.setListHeight();
    if(this.data.is_rename) {
      this.getSearchList();
    }else{
      this.getGoodsList();
    }
  },
  bindgetdata: function () {
    console.log('拖动到底');
  },
  getSearchList: function() {
    App.wxRequest.postRequest('goods/search',{key:this.data.title}).then(res => {
      console.log(res.data.list)
      if (isEmpty(res.data.list)){
        this.setData({
          noList: true
        })
      }else{
        var list = res.data.list.concat(),
          storeList = res.data.list.concat();

        this.setData({
          list: res.data.list,
          storeList: storeList
        })
      }  
    }).catch(err => {
      App.showError(err.errMsg);
    }).finally(() => {
      wx.hideLoading()
    })
  },
  getGoodsList: function () {
    App.wxRequest.postRequest('goods/category',{
      category_id: Number(this.data.c_id)
    }).then(res => {
      if (isEmpty(res.data.list)) {
        this.setData({
          noList: true
        })
      } else {
        var list = res.data.list.concat(),
          storeList = res.data.list.concat();

        this.setData({
          list: res.data.list,
          storeList: storeList
        })
      }
      }).catch(err => {
        App.showError(err.errMsg);
      }).finally(() => {
        wx.hideLoading()
      })
  },

  onChange: function (event) {
    var types = ['normal', 'new', 'price', 'sales'];
    var sel_type = types[event.detail];
      
    if(sel_type !== 'price') {
      var newlist = this.quickSort(this.data.list, sel_type);
      console.log(newlist)
      this.setData({
        list: newlist,
        down: true,
        ifPriceActive:false
      })
    }
    
  },
  resetprice: function() {
    setTimeout(() => {
      if (this.data.ifPriceActive) {
        this.setData({
          down: !this.data.down
        })
      }else{
        this.setData({
          ifPriceActive: true
        })
      }

      var newlist = this.quickSort(this.data.list, 'price');
      if(this.data.down) {
        this.setData({
          list: newlist.reverse()
        })
      }else{
        this.setData({
          list: newlist
        })
      }
      
    },100)
  },
  setListHeight: function () {
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          scrollHeight: res.windowHeight - 50
        });
      }
    })
  },
  quickSort: function(arr,type) {
    var flag = '';
    switch(type) {
      case 'normal':
        flag = '';
        break
      case 'new':
        flag = 'createtime';
        break;
      case 'price':
        flag = 'goods_min_price';
        break;
      case 'sales':
        flag = "goods_sales";
        break; 
      default:
        flag = '';  
    }
    console.log(flag !== '');
    if(flag !== '') {
      for (let i = 0; i < arr.length - 1; i++) {
        for (let j = 0; j < arr.length - 1 - i; j++) {
          if (parseInt(arr[j][flag]) < parseInt(arr[j + 1][flag])) {
            var temp = arr[j];
            arr[j] = arr[j + 1];
            arr[j + 1] = temp;
          }
        }
      }
      return arr;
    }else{
      arr = this.data.storeList.concat();
      return arr;
    }
  }
})