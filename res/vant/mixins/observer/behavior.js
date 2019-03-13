export var behavior = Behavior({
  //组件最重要的生命周期是 created attached detached
  //组件调用多个相同的生命周期会逐个执行
  created: function created() { 
    //组件实例刚刚被创建好时， created 生命周期被触发。此时，组件数据 this.data 就是在 Component 构造器中定义的数据 data
    //此时还不能调用 setData 。 通常情况下，这个生命周期只应该用于给组件 this 添加一些自定义属性字段
    // console.log(this.$options)
    var _this = this;
    if (!this.$options) {
      return;
    }

    var cache = {};
    var setData = this.setData;

    // _this$$options 组件的所有参数
    var _this$$options = this.$options(),
        computed = _this$$options.computed;
    // console.log(computed.iconClass);
    // 组件要computed的参数列表
    var keys = Object.keys(computed);

    var calcComputed = function calcComputed() {
      var needUpdate = {};
      // console.log(keys)
      keys.forEach(function (key) {
        // computed[key] 函数绑定this执行 value是这个函数的返回值
        var value = computed[key].call(_this);
        // console.log(value)
        if (cache[key] !== value) {
          cache[key] = needUpdate[key] = value;
        }
      });
      return needUpdate;
    };

    Object.defineProperty(this, 'setData', {
      writable: true
    });


    // 页面每次修改数据都调用了修改后的setData，修改数据后会回调calcComputed()，如果回调函数计算的结果和之前不同就会再次调用setData函数对数据进行修改
    //再次调用的这个setData是被修改前就保存的，不会继续调用calcComputed()
    this.setData = function (data, callback) {
      // console.log(data)
      data && setData.call(_this, data, callback);
      setData.call(_this, calcComputed());
    };
  },
  attached: function attached() {
    //生命周期被触发。此时， this.data 已被初始化为组件的当前值。这个生命周期很有用，绝大多数初始化工作可以在这个时机进行。
    this.setData();
  }
});