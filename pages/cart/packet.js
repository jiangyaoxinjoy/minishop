let App = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    packet_list:[
      // {
      //   title:'红包标题',
      //   desc:"限2019.1.1使用",
      //   canUse:true,
      //   price:5,
      //   limit:"满30元使用",
      //   packet_id:1
      // }
    ],
    packet_nonuse:'nonuse'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    App.wxRequest.getRequest('index/coupon').then(res => {
      
      if(res.data.code === 1) {
        var packetList = res.data.data;
        console.log(packetList);
        that.setData({
          packet_list: packetList
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  onUsePacket: function(e) {
    // console.log(e)
    wx.navigateBack({
      type:'packet'
    })
  }
})