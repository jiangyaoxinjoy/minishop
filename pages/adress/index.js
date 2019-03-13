let App = getApp();
import {doAfterToken } from '../../utils/util';
Page({

  data: {
    adresslist:[],
    fromType:'',
    isNodata: false,
    ifonshow: true
  },

  onLoad: function (options) {
    console.log(options)
    this.setData({
      fromType: options.type || ''
    })
  },
  onShow: function () {    
    doAfterToken.call(App, this.getlists);
  },
  getlists: function() {
    App.wxRequest.postRequest('address/getlists').then(res => {
      this.setData({
        adresslist: res.data.Data
      }, () => {
        this.check_is_noData();
        if (this.data.ifonshow) {
          this.showDetail();
          this.setData({
            ifonshow: false
          })
        }
      })     
    })
  },
  showDetail:function() {
    this.SwipeCellList = this.selectAllComponents(".vscell");
    //这里对所有的 vscell 默认选取
    this.SwipeCellList.forEach((value, index, array) => {
      //console.log(value.dataset.defult);
      if (value.dataset.defult == '1') {
        this.SwipeCellList[index].open("left");
      }
    });
    if (this.SwipeCellList[1]) {
      this.SwipeCellList[1].open("right");
    }
    setTimeout(() => {
      this.SwipeCellList.forEach((value, index, array) => {
        if (value.dataset.defult == '1') {
          this.SwipeCellList[index].close();
        }
      });
      if (this.SwipeCellList[1]) {
        this.SwipeCellList[1].close();
      }
    }, 800)
  },
  //点击地址，组件传值，判断点击left，right，cell
  onclickItem: function (e) {
    console.log(e);    
    let that = this;
    if (e.detail == "cell") {
      if (this.data.fromType === 'checkout' ){   
        var pages = getCurrentPages();
        var currPage = pages[pages.length - 1];   //当前页面
        var prevPage = pages[pages.length - 2];  //上一个页面
        prevPage.setData({
          address_id: e.currentTarget.dataset.adressid
          // address: this.data.adresslist[e.currentTarget.dataset.id]
        })
        wx.navigateBack()
      }
    }
    if (e.detail =="left"){
      var idx = e.target.dataset.id;
      this.data.adresslist.forEach(function (value, index, array) {
        if (index == idx){
          value.isdefault = "1";
          //设置默认项
          App.wxRequest.postRequest('address/setdefault',{address_id: Number(value.address_id)}).then(result => {
            App.showSuccess('设置成功');
          }).catch(err => {
            App.showError('设置失败');
          })
          // App._post('adress/setdefault', { id: value.address_id}, function (result) {
          //   App.showSuccess(result.msg);
          // });

        }else{
          value.isdefault = "0";
        }
      });
      this.setData({
        adresslist: this.data.adresslist
      });
      return;
    }
    if (e.detail == "right"){
      var idx = e.target.dataset.id;
      if (this.data.adresslist.length <= 1){
        App.showError('至少保留一个收货地址。');
        return;
      }
      this.data.adresslist.every(function (value, index) {
        if (index == idx) {
          //如果删除的为默认项
          if (value.isdefault == "1"){
            App.showError('无法删除默认项。');
          } else {
            that.data.adresslist.splice(index, 1);
          //这里提交删除
            App.wxRequest.postRequest('address/del',{address_id: Number(value.address_id)}).then(result => {
              // if (this.data.fromType === 'checkout') {
              //   var pages = getCurrentPages();
              //   var prevPage = pages[pages.length - 2];  //上一个页面
              //   var address;            
              //   if (prevPage.data.address.address_id == value.address_id) {
              //     this.data.adresslist.forEach((val, i) => {
              //       if (val.isdefault === 1) {
              //         address = val
              //       }
              //     })
              //     prevPage.setData({
              //       address: address[e.currentTarget.dataset.id]
              //     })
              //   }
              // }
              App.showSuccess('删除成功');
            }).catch(err => {
              App.showError('删除失败');
            })
          }
          return false;
        }
        return true;
      });

      this.setData({
        adresslist: this.data.adresslist
      });
      return;
    }
  },

  createAddress:function(){
    wx.navigateTo({
      url: './create'
    });
  },
  onClick: function(e) {
    console.log(e)
    var idx = e.target.dataset.adressid;
    wx.navigateTo({
      url: './edit?id=' + idx
    });
  },
  check_is_noData: function() {
    if (this.data.adresslist.length === 0) {
      this.setData({
        isNodata: true
      })
    }
  }
})