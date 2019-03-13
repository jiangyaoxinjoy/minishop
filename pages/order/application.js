var App = getApp();
import { dateTimeFormatter} from '../../utils/util.js'
import Toast from '../../res/vant/toast/toast';
Page({
  data: {
    order_goods:[],
    detail:'',
    order_id:'',
    new_request_num:0,
    user_request:"",
    max_num:''
  },

  onLoad: function (options) {
    // console.log(options)
    this.setData({
      user_request: options.type,
      order_id: options.orderid,
      order_goods_id:options.id
    })
    var params = {
      order_goods_id: parseInt(options.id),
      user_request: options.type
    }
    this.getAfterGoods(options.id, params);
  },
  getAfterGoods: function (id, params) {
    App.wxRequest.postRequest('aftersales/goodsinfo', { order_goods_id: Number(id) }).then(res => {
      this.setData({
        order_goods: res.data.data.order_goods
      },() => {
        this.getAfterData(params);
      })
    })
  },
  getAfterData:function(params) {
    // console.log(params)
    App.wxRequest.postRequest('aftersales/request', params).then(res => {
      // console.log(res.data.data);
      var detail = res.data.data;
      if (params.user_request == 10) {
        detail.show_text_explain = '退款原因';
        detail.type_text = '仅退款';
        detail.type_desc = '退款申请';
      }
      if (params.user_request == 20) {
        detail.show_text_explain = '退款原因';
        detail.type_text = '货到退款';
        detail.type_desc = '退款申请';
      }
      if (params.user_request == 30) {
        detail.show_text_explain = '换货原因';
        detail.type_text = '换货';
        detail.type_desc = '换货申请'
      }
      wx.setNavigationBarTitle({
        title: detail.type_desc
      })
      detail.createtime = dateTimeFormatter(detail.createtime);
      detail.updatetime = dateTimeFormatter(detail.updatetime);
      if (detail.updatetime === detail.createtime) {
        detail.updatetime = 0
      }
      // detail.exp_no = detail.exp_no === 0 ? 1 : detail.exp_no;
      var num = detail.exp_no;
      if (detail.exp_no == 0) {
        num = 1
      }
      this.setData({
        detail,
        max_num: this.data.order_goods.total_num,
        new_request_num: num        
      })
    })
  },

  onChange: function(e) {
    this.setData({
      new_request_num:e.detail
    })
  },

  submitData: function(e) {
    var values = e.detail.value,
        detail = this.data.detail;
    console.log(values)

    // 第一次提交申请
    if (detail.status == '' && detail.is_first_request === 1) {
      var params = {
        order_goods_id: parseInt(this.data.order_goods.id),
        user_request: this.data.user_request,
        order_id: parseInt(this.data.order_id),
        request_number: parseInt(this.data.new_request_num),
        content: values.explain
      };
      App.wxRequest.postRequest('aftersales/request/add', params).then(res => {
        console.log(res.data);
        if (res.data.code === 1){
          Toast.success('提交申请成功');
        }else{
          Toast(res.data.msg);
          var params = {
            order_goods_id: parseInt(this.data.order_goods.id),
            user_request: this.data.user_request
          }
          this.getAfterData(params);
        }
      })
    }

    // 修改申请或者提交快递
    if (detail.status == '10' || detail.status == '20') {
      var params = {
        kf_id: parseInt(detail.kf_id),
        order_goods_id: parseInt(detail.order_goods_id),
        request_number: parseInt(this.data.new_request_num) - parseInt(detail.exp_no),
        content: values.explain,
        receive_express_company: values.receive_express_company || '0',
        receive_express_no: values.receive_express_no || '0',
        receive_express_fee: values.receive_express_fee || '0',
        update_type:detail.status
      };
      App.wxRequest.postRequest('aftersales/request/update', params).then(res => {
        console.log(res.data)
        if (res.data.code === 1) {
          Toast.success('提交申请成功');
        } else {
          App.showError(res.data.msg)
          var params = {
            order_goods_id: parseInt(detail.order_goods_id),
            user_request: detail.user_request
          }
          this.getAfterData(params);
        }       
      })
    }
  },
  repeal_request: function() {

  }
})