import { classNames } from '../common/class-names'; //classNames 是一个拼接类名的方法

// 构造器--构造行为
//行为能够被其他组件一起使用
// classNames,$emit,getRect可以被其他组件使用
export var basic = Behavior({
  methods: {
    classNames: classNames,
    $emit: function $emit() { //向主页面传值的方法
      // console.log(arguments)
      this.triggerEvent.apply(this, arguments);
    },
    getRect: function getRect(selector, all) {
      var _this = this;
  
      return new Promise(function (resolve) {
        wx.createSelectorQuery().in(_this)[all ? 'selectAll' : 'select'](selector).boundingClientRect(function (rect) {
          if (all && Array.isArray(rect) && rect.length) {
            resolve(rect);
          }

          if (!all && rect) {
            resolve(rect);
          }
        }).exec();
      });
    }
  }
});