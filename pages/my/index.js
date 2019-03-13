let App = getApp();
import { doAfterToken } from '../../utils/util';
Page({

  data: {
    userInfo: {
      id: 0,
      avatar: '../../assets/img/avatar.png',
      nickname: '游客',
      balance: 0,
      score: 0,
      level: 0,
      group_id: 1,
      mobile:"NoLoginData",
    },
    datanum:[],
  },

  onLoad: function (options) {
    doAfterToken.call(App, this.getUserinfo);
  },
  getUserinfo: function() {
    App.getUserBaseInfo().then(res => {
      // console.log(res.data.data.userInfo);
      this.setData({ userInfo: res.data.data.userInfo });
    })
  },
  onShow: function () {},
  onGotUserInfo: function (e) {
    // console.log(e.detail);
    if (e.detail.userInfo == undefined) {
      return;
    }
    var token = wx.getStorageSync('token') || '';
    if (e.detail.errMsg == 'getUserInfo:ok') {
      var userinfo = e.detail.userInfo;
      App.wxRequest.postRequest('user/login', {
        nickname: userinfo.nickName,
        avatar: userinfo.avatarUrl
      }).then(res => {
        // console.log(res)
        this.getUserinfo();
      })
    }
  },
  checkauth: function (str) {
    wx.getSetting({
      success: (response) => {
        if (!response.authSetting[str]) {
          wx.authorize({
            scope: str,
            success: () => {
              console.log('授权成功')
            }
          })
        }
      }
    })
  }
})