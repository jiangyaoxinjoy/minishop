let App = getApp();
Page({

  data: {
    active: 0,
    category:[],
    scrollTop:0,
    api_url: App.Domain,
    re_value:'',
  },


  onLoad: function (options) {
    wx.showLoading({
      title:"加载中"
    })
    App.wxRequest.getRequest('category/list').then(res => {
      console.log(res);
      this.setData({
        category: res.data.data
      })
    }).catch(err => {
      App.showError(err.errMsg);
    }).finally( () =>{
      wx.hideLoading()
    })
  },

  onShow: function () {

  },
  onChange: function(event) {
    this.setData({
      active: event.detail
    })
  },
  // 修改关键词
  onSearchchange: function (event) {
    this.setData({
      re_value: event.detail
    })
  },
  onSearch: function (event) {
    console.log(event);
    //这里跳转到  搜索页
    wx.navigateTo({
      url: './list?rename=1&name=' + this.data.re_value
    })
  },
})