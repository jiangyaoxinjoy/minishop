import Toast from '/res/vant/toast/toast';
var config = require('./utils/config');
var wxRequest = require('./utils/wxRequest.js');
var wxApi = require('./utils/wxApi.js');
import { isEmpty} from './utils/util';
App({
  wxRequest: wxRequest,
  wxApi: wxApi,
  onLaunch: function (options) {
    // console.log('api')
    console.log(options);
   
    /*
    //生产环境获取参数的方法
    var scene = decodeURIComponent(options.scene);
    // var goods_id = options.scene.split("&")[0];
    // let affid = options.scene.split('&')[1];
    
    // 有解释说&解析为','
    let info_arr = [];
    info_arr = scene.split(',');
    var goods_id = info_arr[0];
    let affid = info_arr[1];
   
    */
    // 获取推荐码
    let affid = options.query.affid || 0;
    this.globalData.recommendId = affid;
    
    /**
     * 初次加载判断网络情况
     * 无网络状态下根据实际情况进行调整
     */
    var getnetworkType = wxApi.wxPromisify(wx.getNetworkType);
    getnetworkType()
    .then(res => {
      const networkType = res.networkType;
      if (networkType === 'none'){
        this.showError('当前无网络')
      }else{
        //判断是否登录
        this.check();
      }
    })
    /**
     * 监听网络状态变化
     * 可根据业务需求进行调整
     */
    wx.onNetworkStatusChange(res => {
      if (!res.isConnected) {
        this.globalData.isConnected = false;
        this.showError('网络已断开')
      } else {
        this.globalData.isConnected = true
        wx.hideToast();
      }
    })
  },
  onShow: function (options) {
    // 如果onLaunch没有推荐码，再次获取
    if (this.globalData.recommendId === 0) {
      let affid = options.query.affid || 0;
      this.globalData.recommendId = affid;
      if(affid !== 0) {
        this.login();        
      }
    }
    console.log(options)
  },
  getUserBaseInfo: function () {
    // console.log('app.js getUserBaseInfo');
    return this.wxRequest.postRequest('user/userinfo')
  },
  /* 关于登录 */
  //判断是否登录
  check: function () {
    var checkSession = this.wxApi.checkSession();
    checkSession().then(res => {
      var token = wx.getStorageSync('token');
      var affid = wx.getStorageSync('affid');
      if (isEmpty(token) || isEmpty(affid)) {
        this.login();
      }
    }).catch(err => {
      this.login();
    })
  },
  showError: function (msg, callback) {
    wx.showModal({
      title: '温馨提示',
      content: msg,
      showCancel: false,
      success: function (res) {
        callback && callback();
      }
    });
  },
  showSuccess: function (msg, callback) {
    Toast.success(msg);
    callback && (setTimeout(function () {
      callback();
    }, 800));
  },
  //登录
  login: function () {
    var recommendId = this.globalData.recommendId,
        wxLogin = this.wxApi.wxLogin();

    wxLogin()
    .then(res => {
      if(res.code) {
        let params = {
          code: res.code,
          affid: Number(recommendId)
        };
        var postRequest = this.wxApi.wxPromisify(wx.request);
        return postRequest({
          url: this.globalData.api_url + 'user/login_hawk',
          method: 'POST',
          data: params
        })
      }
    })
    .then(res => {   
      // console.log(res);  
      if(res.data.code === 1) {
         //保存token
        wx.setStorageSync('token', res.data.token);
        wx.setStorageSync('affid', res.data.affid);
        if (this.doAfterToken) {
          this.doAfterToken()
        }
      }
    })
    .catch((res) => {
      console.log(res);
      this.showError('登录错误')
    })
  },
  globalData: {
    api_url: "http://192.168.1.44:8080/",
    isConnected: true,
    recommendId:0
  },
})