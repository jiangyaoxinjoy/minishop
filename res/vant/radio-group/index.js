import { VantComponent } from '../common/component';
VantComponent({
  field: true,
  relation: {
    name: 'radio',
    type: 'descendant', // 关联的目标节点应为子孙节点
    linked: function linked(target) {
      //每次有radio被插入时执行，target是该节点实例对象，触发在该节点attached生命周期之后
      //this.data是radio-group的data
      var _this$data = this.data,
          value = _this$data.value,
          disabled = _this$data.disabled;
      // console.log(target);
      //target.setData设置插入节点的value,判断是否选中
      target.setData({
        value: value,
        disabled: disabled || target.data.disabled
      });
      // console.log(target);
    }
  },
  props: {
    value: null, //主页面传值，当前选中的规格
    disabled: Boolean //主页面没有传值，默认值为false
  },
  
  //watch方法相当于给data数据添加observer方法，属性被改变时执行的函数
  watch: {
    /**
     * 每个方法可以有三个参数
     * newVal, oldVal, changedPath
     */
    value: function value(_value) {
      // console.log(_value);
      //监听页面传递的value的变化，修改radio的value值。
      var children = this.getRelationNodes('../radio/index');
      children.forEach(function (child) {
        child.setData({
          value: _value
        });
      });
    },
    disabled: function disabled(_disabled) {
      console.log(_disabled);
      var children = this.getRelationNodes('../radio/index');
      children.forEach(function (child) {
        child.setData({
          disabled: _disabled || child.data.disabled
        });
      });
    }
  }
});