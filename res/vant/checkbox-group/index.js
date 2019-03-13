import { VantComponent } from '../common/component';
VantComponent({
  field: true,
  relation: {
    name: 'checkbox',
    type: 'descendant',
    linked: function linked(target) {
      var _this$data = this.data,
          value = _this$data.value,
          disabled = _this$data.disabled;
          // console.log(value)
      // console.log(target.data.name)
      // console.log(value.indexOf(target.data.name))
      target.setData({
        value: value.indexOf(parseInt(target.data.name)) !== -1,
        disabled: disabled || target.data.disabled
      });
    }
  },
  props: {
    value: Array,
    disabled: Boolean,
    max: Number
  },
  watch: {
    value: function value(_value) {
      // console.log(_value)
      var children = this.getRelationNodes('../checkbox/index');
      children.forEach(function (child) {
        child.setData({
          value: _value.indexOf(parseInt(child.data.name)) !== -1
        });
      });
    },
    disabled: function disabled(_disabled) {
      var children = this.getRelationNodes('../checkbox/index');
      children.forEach(function (child) {
        child.setData({
          disabled: _disabled || child.data.disabled
        });
      });
    }
  }
});