let App = getApp();
Page({

  data: {
    region: '',
    detail: {},
    disabled: false
  },

  onLoad: function (options) {
    let that = this;
    App.wxRequest.postRequest('address/get', {address_id: Number(options.id)}).then(res => {
      console.log(res.data.data);
      var region = [];
      region.push(res.data.data.province);
      region.push(res.data.data.city);
      region.push(res.data.data.region);
      that.setData({
        detail: res.data.data,
        region: region
      });
    })
  },

  saveData: function (e){
    let that = this;
    let values = e.detail.value;
    values.region = this.data.region;
    var allregion = this.data.region;
    values.province = allregion[0];
    values.city = allregion[1];
    values.region = allregion[2];
  
    console.log(values);
    // 表单验证
    if (!that.validation(values)) {
      App.showError(that.data.error);
      return false;
    }
    // 按钮禁用
    that.setData({
      disabled: true
    });
    //这里提交服务器
    values.address_id = that.data.detail.address_id;
    App.wxRequest.postRequest('address/update',values).then(res => {
      console.log(res.data);
      if(res.data.code == 1) {
        App.showSuccess('修改成功', function () {
          wx.navigateBack();
        });
      }else{
        App.showError('修改失败', function () {
          // wx.navigateBack();
        });
      }
    }).catch(err => {
      App.showError('修改失败', function () {
        wx.navigateBack();
      });
    }).finally( () => {
      that.setData({
        disabled: false
      });
    })
    // App._post('adress/edit', values, function (result) {
    //   console.log(result.msg);
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
        ['detail.phone']: result.data.phoneNumber
      });
    });
  },
})