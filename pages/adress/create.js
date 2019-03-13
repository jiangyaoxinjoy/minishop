let App = getApp();
Page({

  data: {
    region:null,
    disabled:false,
    phoneNumber:"",
    checked: false,
    setDefault:0,
    name:''
  },

  onLoad: function (options) {
    console.log(options.setDefault)
    if (options.setDefault == 1){
      this.setData({
        setDefault: options.setDefault
      })
    }
  },

  onShow: function () {

  },

  saveData: function (e) {
    // console.log(e);
    let that = this;
    let values = e.detail.value;
    // 表单验证
    if (!that.validation(values)) {
      App.showError(that.data.error);
      return false;
    }
    var allregion = this.data.region;
    //去除 省会城市 多了 市的bug
    // var pr_temp = values.region[0];
    // if (pr_temp.charAt(pr_temp.length - 1) == "市") {
    //   pr_temp = pr_temp.substr(0, pr_temp.length - 1);
    //   values.region[0] = pr_temp;
    // }
    values.province = allregion[0];
    values.city = allregion[1];
    values.region = allregion[2];
    // var temp_ragion = values.region.join('');
    // values.region = temp_ragion;
    console.log(values);
    // 按钮禁用
    that.setData({
      disabled: true
    });
    App.wxRequest.postRequest('address/add',values).then( res => {
        if(res.data.code == 1) {
          App.showSuccess('地址添加成功', function () {       
            // if(that.data.setDefault == 1){
            //   App.wxRequest.postRequest('address/setdefault', {
            //     address_id: Number(res.data.addressid)
            //   }).then(result => {
            //     console.log(result);
            //   })
            // }
            wx.navigateBack();
          });
        }
      if (res.data.code == 0 && res.data.msg.indexOf("Duplicate") != -1 ){
        App.showError('不能重复提交地址',function() {
          wx.navigateBack();
        });
      }
    }).catch(err => {
      App.showError(err.msg, function () {
        wx.navigateBack();
      });
    })
    //这里提交服务器
    // App._post('adress/add', values, function (result) {
    //  // console.log(result.msg);
    //   App.showSuccess(result.msg, function () {
    //     wx.navigateBack();
    //   });
    // }, false, function () {
    //   that.setData({
    //     disabled: false
    //   });
    // });
  },

  validation: function (values) {
    if (values.name === '') {
      this.data.error = '收件人不能为空';
      return false;
    }
    if (values.phone.length < 1) {
      this.data.error = '手机号不能为空';
      return false;
    }
    if (values.phone.length !== 11) {
      this.data.error = '手机号长度有误';
      return false;
    }
    let reg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1})|(16[0-9]{1}))+\d{8})$/;
    if (!reg.test(values.phone)) {
      this.data.error = '手机号不符合要求';
      return false;
    }
    if (!this.data.region) {
      this.data.error = '省市区不能空';
      return false;
    }
    if (values.detail === '') {
      this.data.error = '详细地址不能为空';
      return false;
    }
    return true;
  },
  bindRegionChange: function (e) {
    this.setData({
      region: e.detail.value
    })
  },
  getPhoneNumber: function (e) {
    if (e.detail.iv == undefined) {
      return;
    }
    let dataTMp = [];
    dataTMp.encryptedData = e.detail.encryptedData;
    dataTMp.iv = e.detail.iv;
    var that = this;
    App._post('aboutwechat/get_PhoneNum', dataTMp, function (result) {
      App.showSuccess('成功获取');
      that.setData({
        phoneNumber: result.data.phoneNumber
      });
    });
  },
  noop: function(e) {
    var value = !this.data.checked;
    console.log(value);
    this.setData({
      checked: value
    })
  }
})