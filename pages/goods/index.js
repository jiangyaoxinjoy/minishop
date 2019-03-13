let App = getApp();
const util = require('../../utils/util');
let wxParse = require("../../res/wxParse/wxParse.js");
import { wxPromisify, promiseResolve} from '../../utils/wxApi.js';
import { wxSaveImageToPhotosAlbum } from '../../utils/canvas.js';
import { doAfterToken, isEmpty } from '../../utils/util';
Page({

  data: {
    // banner轮播组件属性
    indicatorDots: true, // 是否显示面板指示点	
    autoplay: true, // 是否自动切换
    interval: 3000, // 自动切换时间间隔
    duration: 800, // 滑动动画时长
    wxapp: [],
    detail:[],
    api_url: App.Domain,
    goods_spec_arr: [], // 记录规格的数组
    spec_data:[], //商品规格信息，包括规格的属性spec_attr，不同规定的商品列表spec_list;
    goods_num:1,//购买数量
    goods_sku_id: 0, // 规格id
    goods_price:0,
    stock_num:0, //库存
    line_price:0,
    cartnum:0,
    addcart_loading:false, // 加入购物车的loading
    current_img_index:0,
    sku_hidden_arr:[],
    doLogin: false,
    goods_image:"",
    panelShow: false, 
    share_pop: false,
    // isShowCav: true,
    canvasUrl:"",
    canvasShow: false,
    attr_show_from:1,
    islogin: false
  },

  onLoad: function (options) {
    wx.showLoading({
      title:"加载中"
    })
    // console.log(options)
    if (options.scene) {
      console.log('e')
      var scene = options.scene;
      var goods_id = options.scene.split("#")[0];
      /*
       //生产环境获取参数的方法
      var scene = decodeURIComponent(options.scene);
      var goods_id = options.scene.split("&")[0];
      let affid = options.scene.split('&')[1];
      */
    }else{
      var goods_id = options.goods_id;
    }
   
    this.setData({
      goods_id: goods_id,
    }, () => {
      doAfterToken.call(App, this.getGoodsDetail);
    })

    App.getUserBaseInfo().then(res => {
      this.setData({
        islogin: res.data.data.userInfo.islogin === 1
      })
    })
    
    /*
    var data = {
      page: "pages/goods/index",
      scene: this.data.goods_id & 41,
      width: 300
    }
    wx.request({
      method:'POST',
      data:data,
      url: 'https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=19_u2RGSuMPhoJNECgc6XL8kXx2sWfFHfkbu7w96ra8NYGofoJRIe7LMlYNrGth3ganPRNvvwQUzWzxZKMkEEkALeEAtYkvCPZ-6Zq5O81ak__f63tJhQaTxVo26FSfW6RA7-phkN_RYfF_z6JnAWCiADATPV',
      success: function(res){
        console.log(res);
      }
    })*/
  },
  onShow:function() {},
  getGoodsDetail: function() {
    // var that = this;
    App.wxRequest.postRequest('goods/detail', {
      goods_id: Number(this.data.goods_id)
    }).then(res => {
      var result = res.data;
      console.log(result.data);
      wx.setNavigationBarTitle({
        title: result.data.detail.goods_name
      });

      //"goods_stauts": "20" 20代表下架
      if (result.data.detail.goods_stauts === '20') {
        App.showError('商品已经下架',function() {
          wx.switchTab({
            url: '../index/index'
          })
        })
      }
     
      // 初始化商品多规格
      if (result.data.detail.spec_type === '20') {
        //20代表商品有多规格
        this.initManySpecData(result.data);
      } else {
        this.setData(
          {
            goods_sku_id: result.data.detail.spec[0].spec_sku_id,
            goods_price: result.data.detail.spec[0].goods_price,
            line_price: result.data.detail.spec[0].line_price,
            stock_num: result.data.detail.spec[0].stock_num,
            goods_image: result.data.detail.spec[0].spec_image || result.data.detail.imgs_url[0]
          }
        );
      }

      //根据选择后的情况 分配sku的可选情况
      if (result.data.detail.spec_type === '20') {
        this.make_sku_showData(result.data.spec_data, 0);
      }

      //这里处理富文本
      if (result.data.detail.content.length > 0) {
        //首先把图片格式化
        result.data.detail.content = result.data.detail.content.replace(/<img src="\/uploads\//ig, "<img src=\"" + this.data.api_url + "\/uploads\/");
        wxParse.wxParse('content', 'html', result.data.detail.content, this, 0);
      }

      // console.log(this.data.goods_spec_arr)
      this.setData(
        {
          detail: result.data.detail,
          spec_data: result.data.spec_data,
          goods_spec_arr: this.data.goods_spec_arr,
        }
      );
      }).catch(err => {
        App.showError(err.errMsg);
      }).finally(() => {
        wx.hideLoading()
      })
  },
  make_sku_showData: function (data,break_num) {
    // console.log(data);
    
    // Showskuiteam 规格分组
    var Showskuiteam = data.spec_attr;
  
    //初始化显示数据hidden为false
    Showskuiteam.forEach((value, index) => {
      value.spec_items.forEach((value1, index1) => { 
        value1.hidden = false; 
        // console.log(value1)
      });
    });

    //循环 行规格 可选格式化，根据后面所有不变的sku规格
    Showskuiteam.forEach((value, index) => {
      //这里 那一个选项
      //if (index != break_num) {
        this.for_eachsku_showData(Showskuiteam, index);
      //}
    });
  },

  for_eachsku_showData: function (Showskuiteam, ForNum) {
    console.log(Showskuiteam)
    //影藏sku组合情况：
    var Sku_hidden = this.data.sku_hidden_arr;
    // console.log(Sku_hidden);
    //现在选择的情况是：选择的规格数组
    var Nowselect = this.data.goods_spec_arr;
    // console.log(Nowselect)
    //循环 每行规格 可选格式化，根据后面所有不变的sku规格
    Sku_hidden.forEach( (Sku_hiddenvalue, Sku_hiddenindex, Sku_hiddenarray) => {
      //针对每个影藏sku 匹配
      var peiduiNum = 0;
      Sku_hiddenvalue.forEach(function (value, index, array) {
        if (index != ForNum) {
          if (value == Nowselect[index]) {
            peiduiNum++;
          }
        }
      });
      if (peiduiNum == (Nowselect.length - 1)) {
        //此时 此sku为影藏项目
        Showskuiteam.forEach(function (Showskuiteamvalue, Showskuiteamindex, Showskuiteamarray) {
          Showskuiteamvalue.spec_items.forEach(function (value1, index1, array1) {
            if (value1.item_id == Sku_hiddenvalue[ForNum]) {
              value1.hidden = true;
            }
          });
        });
      }
    });
  },
  /**
     * 初始化商品多规格
     */
  initManySpecData: function (data) {
    console.log(data);
    var that = this;
    for (let i in data.spec_data.spec_list) {
      //库存大于0
      if (data.spec_data.spec_list[i].form.stock_num >= 0){
        //多规格商品的规格编码
        var sku_id = data.spec_data.spec_list[i].spec_sku_id.split('_'); //转成数组。
        // console.log(sku_id)
        //初始化 sku 显示
        // 商品价格/划线价/库存
        this.setData({
            goods_sku_id: data.detail.spec[i].spec_sku_id,
            goods_price: data.detail.spec[i].goods_price,
            line_price: data.detail.spec[i].line_price,
            stock_num: data.detail.spec[i].stock_num,
            goods_image: data.detail.spec[i].spec_image || data.detail.imgs_url[0]
        });

        //goods_spec_arr多规格商品的规格编码数组。
        for (let j in sku_id) {
          this.data.goods_spec_arr[j] = parseInt(sku_id[j]);
        }
        // console.log(that.data.goods_spec_arr);
        break;
      }
    }

    //初始化 影藏sku数组
    this.data.sku_hidden_arr = [];
    //data.spec_data.spec_list 不同规格的商品列表
    for (let i in data.spec_data.spec_list) {
      if (data.spec_data.spec_list[i].form.stock_num < 0) {
        //放入规格数组
        this.data.sku_hidden_arr.push(data.spec_data.spec_list[i].spec_sku_id.split('_'));
      }
    }
  },
  check_good_sel_sku: function (goods_spec_arr) {
    var re_r = true;
    //影藏sku组合情况：
    var Sku_hidden = this.data.sku_hidden_arr;
    Sku_hidden.forEach(function (Sku_hiddenvalue, Sku_hiddenindex, Sku_hiddenarray) {
      //针对每个影藏sku 匹配
      var peiduiNum = 0;
      Sku_hiddenvalue.forEach(function (value, index, array) {
        if (value == goods_spec_arr[index]) {
          peiduiNum++;
        }
      });
      if (peiduiNum == Sku_hiddenvalue.length) {
        //发现了不合法
        re_r = false;
      }
    });
    return re_r;
  },
  make_good_sel_sku: function (goods_spec_arr, attr_idx) {
    var that = this;
    //首先判断此选项是否合法
    if (that.check_good_sel_sku(goods_spec_arr)){

    }else{
      //循环sku列表 找到当前选择的第一匹配sku项目
      var spec_list = this.data.spec_data.spec_list;
      spec_list.forEach(function (value, index, array) {
        if (value.form.stock_num >= 0) {
          var sku_id_arr = value.spec_sku_id.split('_');
          sku_id_arr.forEach(function (sku_id_arrvalue, sku_id_arrindex, sku_id_arrarray) {
            if (sku_id_arrindex == attr_idx && goods_spec_arr[sku_id_arrindex] == sku_id_arrvalue){
              //找到目前的匹配项 可使用的sku
              goods_spec_arr = sku_id_arr;
            }
          });
        }
      });
    }
    //格式化
    goods_spec_arr.forEach(function (value, index, array) {
      goods_spec_arr[index] = parseInt(value);
    });

    that.setData({
      goods_spec_arr: goods_spec_arr,
    });
  },

  //bind:change="RonChange" 子组件用this.triggerEvent方法向父组件传值
  RonChange: function (e) {
    // console.log(e.detail);
    // console.log(this.data.goods_spec_arr);
    let goods_spec_arr = this.data.goods_spec_arr;
    //修改选中的规格
    goods_spec_arr[e.currentTarget.dataset.attr_idx] = parseInt(e.detail);

    //这里如果发现目前选项是不可选的，那么通过分配其余可选的选项  
    this.make_good_sel_sku(goods_spec_arr, e.currentTarget.dataset.attr_idx);

    this.updateSpecGoods();
    this.make_sku_showData(this.data.spec_data, e.currentTarget.dataset.attr_idx);
    this.setData({
      spec_data: this.data.spec_data,
    });
   // console.log(e);
  },
  /** 更新商品规格信息  */
  updateSpecGoods: function () {
    let spec_sku_id = this.data.goods_spec_arr.join('_');

    // 查找skuItem
    let spec_list = this.data.spec_data.spec_list,
      skuItem = spec_list.find((val) => {
        return val.spec_sku_id == spec_sku_id;
      });
    // 记录goods_sku_id
    // 更新商品价格、划线价、库存
    if (typeof skuItem === 'object') {
      this.setData({
        goods_sku_id: skuItem.spec_sku_id,
        goods_price: skuItem.form.goods_price,
        line_price: skuItem.form.line_price,
        stock_num: skuItem.form.stock_num,
        goods_image: skuItem.form.spec_image || this.data.detail.imgs_url[0]
      });
    }

    //这里对 规格的封面图进行格式化
    //首张图片为
    var frist_img = skuItem.form.imgshow;
    if (isEmpty(frist_img)){
      return;
    }
    // console.log(frist_img)
    var imgs_arr = this.data.detail.imgs_url;
    //查找有重复的 立即删掉
    for (let i in imgs_arr) {
      if (imgs_arr[i] == frist_img){
        imgs_arr.splice(i, 1);
      }
    }
    imgs_arr.unshift(frist_img);
    this.setData({
      'detail.imgs_url': imgs_arr,
      current_img_index:0,
    });
  },

  /**
   * 组件传递值修改购买数量
   */
  onstepChange: function (e) {
    //console.log(e);
    this.setData({
      goods_num: e.detail,
    });
  },
  Tap_topimg: function (e) {
    console.log(e);
    let that = this;
    let id = e.target.dataset.id;

    wx.previewImage({
      current: that.data.detail.imgs_url[id],
      urls: that.data.detail.imgs_url
    })
  },

  //加入购物车组件内触发
  addcart: function (e) {
    if (this.data.islogin) {
      if (!this.data.panelShow) {
        this.setData({
          panelShow: true,
          attr_show_from: 2
        })
      }
    }else{
      this.setData({
        doLogin: true,
        panelShow: false
      })
    }
  },
  goAddcart: function() {
    if(this.data.islogin) {
      this.setData({
        addcart_loading: true
      });
      App.wxRequest.postRequest('cart/add', {
        goods_id: parseInt(this.data.goods_id),
        goods_num: parseInt(this.data.goods_num),
        goods_sku_id: this.data.goods_sku_id || "0",
      }).then(result => {
        console.log(result)
        if (result.data.code == 1) {
          App.showSuccess('添加成功'); //Toast
          this.setData({
            // cartnum: result.data.cart_total_num,
          })
          var hxcheckList = wx.getStorageSync('hxcheckList') || [];
          hxcheckList.push(result.data.cartid);
          wx.setStorageSync('hxcheckList', hxcheckList)
        } else {
          App.showError(result.data.msg)
        }
      })
      .catch(err => {
        App.showError(err);
      })
      .finally(res => {
        this.setData({
          addcart_loading: false,
          panelShow: false
        });
      })
    }else{
      // App.showError('请先登录')
      this.setData({
        doLogin: true,
        panelShow: false
      })
    }
  },
  ByNow: function (e) {
    if(this.data.islogin) {
      if (!this.data.panelShow) {
        this.setData({
          panelShow: true,
          attr_show_from: 3
        })
      }
    }else{
      this.setData({
        doLogin: true,
        panelShow: false
      })
    }   
  },
  goByNow: function() {
    if(this.data.islogin){
      wx.navigateTo({
        url: '../cart/checout?' + util.urlencode({
          type: 'buyNow',
          goods_num: this.data.goods_num,
          goods_sku_id: this.data.goods_sku_id || '',
          goods_id: this.data.goods_id
        })
      });
    }else{
      // App.showError('请先登录')
      this.setData({
        doLogin: true,
        panelShow: false
      })
    } 
  },
  //test 组件传值
  onPlus: function(e) {
    // console.log(e);
  },
  onGotUserInfo: function(e) {
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
        if (res.errMsg == "request:ok"){
          this.setData({
            islogin: true,
            doLogin: false
          })
          App.showSuccess('登录成功')
        }    
      })
    }
  },
  closeDialog: function(e) {
    console.log(e);
  },
  openFold: function(e) {
    this.setData({
      panelShow: true,
      attr_show_from: 1
    })
  },
  closePanel: function(e) {
    this.setData({
      panelShow: false
    })
  },
  closepop: function() {
    this.setData({
      panelShow: false
    })
  },
  closesharepop: function() {
    this.setData({
      share_pop: false,
      canvasShow: false
    })
  },
  onShareAppMessage: function (options) {
    // console.log(options)
    var affid = wx.getStorageSync('affid');
    return {
      title: this.data.wxapp.LiteName,
      desc: "",
      path: "/pages/goods/index?affid=" + affid + '&goods_id=' + this.data.goods_id
    };
  },
  share: function() {
    this.setData({
      share_pop: true
    })
  },
  canvas: function (object) {
    let _this = this;
    let realWidth, realHeight;
    //创建节点选择器
    var query = wx.createSelectorQuery();
    //选择id
    query.select('#mycanvas').boundingClientRect();

    new Promise(function (resolve, reject) {
      queryExec(resolve); //1
    }).then(function (result) {

      console.log(result); // 2
      setTimeout(function() {
        // canvanstopath()
      },2000)
      // canvanstopath()
      // return new Promise((resolve, reject) => { // (*)
      //   setTimeout(() => resolve(result * 2), 1000);
      // });
      // return new Promise((resolve, reject) => {
      //   resolve(3) //3
      // })

    })
   
    function queryExec(resolve) {
      query.exec(res => {
        realWidth = res[0].width;
        realHeight = res[0].height;
        const scale = 0.099;
        const ctx = wx.createCanvasContext('mycanvas');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, realWidth, realHeight);
        var getImageInfo = wxPromisify(wx.getImageInfo);
        getImageInfo({ src: '../../assets/img/default.png'}).then(res => {
          console.log(res)
          
        })
        ctx.drawImage('../../assets/img/default.png', (realWidth * scale), (realWidth * scale), (realWidth * (1 - scale * 2)), (realWidth * (1 - scale * 2)));
        ctx.setFontSize(16);
        ctx.setFillStyle("#3a3a3a");
        ctx.fillText(_this.data.detail.goods_name, (realWidth * scale), (realWidth * (1 - scale)) + 20);
        ctx.setFontSize(12);
        ctx.setFillStyle("red");
        ctx.fillText('￥', (realWidth * scale), (realWidth * (1 - scale)) + 50);
        ctx.setFontSize(18);
        ctx.setFillStyle("red");
        ctx.fillText(_this.data.goods_price, (realWidth * scale + 12), (realWidth * (1 - scale)) + 50);
        ctx.moveTo(realWidth * scale, (realWidth * (1 - scale)) + 70);
        ctx.lineTo(realWidth * (1 - scale), (realWidth * (1 - scale)) + 70);
        ctx.lineWidth = 1;          //设置线宽状态
        ctx.strokeStyle = '#dcdcdc';  //设置线的颜色状态
        ctx.stroke();
        ctx.setFontSize(16);
        ctx.setFillStyle("#606060");
        ctx.fillText('长按识别小程序码访问', (realWidth * scale), realWidth + 90);
        ctx.setFontSize(14);
        ctx.setFillStyle("#6f6f6f");
        ctx.fillText('小程序', (realWidth * scale), realWidth + 120);
        ctx.drawImage('../../assets/img/code.png', (realWidth * scale * 5.5), (realWidth + 50), (realWidth * (1 - scale * 7)), (realWidth * (1 - scale * 7)));
        // ctx.draw();
        ctx.draw(false, setTimeout(function () {
          wx.canvasToTempFilePath({
            canvasId: 'mycanvas',
            width: realWidth, //canvas原本的大小
            heght: realHeight,
            destWidth: realWidth*3,  //生成图片的大小设置成canvas大小的3倍
            destHeight: realHeight*3,
            fileType: "png",//文件格式，支持png和jpg
            success: function (res) {
              //这就是生成的文件临时路径
              var tempFilePath = res.tempFilePath;
              _this.setData({
                canvasUrl: res.tempFilePath,
                canvasShow: true
              })
              wx.hideLoading();
            },
            fail: function (res) {
              console.log(res);
            }
          })
        }, 1000))
      })
    }
    function canvanstopath() {
      console.log(realWidth)
      wx.canvasToTempFilePath({
        x: 0,
        y: 0,
        width: realWidth*2,
        height: realHeight * 2,
        destWidth: realWidth * 2,
        destHeight: realHeight * 2,
        canvasId: 'mycanvas',
        success: function (res) {
          var tempFilePath = res.tempFilePath;
          const ctx = wx.createCanvasContext('mycanvas');
          ctx.drawImage(res.tempFilePath, 0, 0, realWidth, realHeight)
          ctx.draw()
          _this.setData({
            canvasUrl: res.tempFilePath
          })
        },
        fail: function (res) {
          console.log(res);
        }
      });
    }
  },
  downloadcode: function(e) {
    wxSaveImageToPhotosAlbum(this.data.canvasUrl).then(res => {
      console.log(res);
      this.setData({
        canvasShow: false,
        share_pop: false
      })
      App.showSuccess('图片保存成功');
    }).catch(err => {
      App.showError('图片保存失败')
    })
  },
  saveimgshow: function() {
    console.log(1)
    this.canvas();
    wx.showLoading({
      title: '图片生成中',
    })
    if (this.data.canvasUrl) {
      this.setData({
        canvasShow: true
      })
      wx.hideLoading();
    }
  },
  shareframeshow: function() {
    this.setData({
      canvasShow:false
    })
  },
  getQrcode() {
    var affid = wx.getStorageSync('affid');
    var data = {
      page: "pages/goods/index",
      scene: this.data.goods_id & 41,
      width: 300
    }
    App.wxRequest.postRequest('', data).then(res =>{
      console.log(res)
      let qrcodeUrl = res.data;//服务器小程序码地址
    })
  },
  imgYu: function (event) {
    var src = event.currentTarget.dataset.src;//获取data-src
    //图片预览
    wx.previewImage({
      current: src, // 当前显示图片的http链接
      urls: [src]// 需要预览的图片http链接列表
    })
  }
})