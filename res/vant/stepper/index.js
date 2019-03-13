import { VantComponent } from '../common/component'; // Note that the bitwise operators and shift operators operate on 32-bit ints
// so in that case, the max safe integer is 2^31-1, or 2147483647

var MAX = 2147483647;
VantComponent({
  field: true,
  classes: ['input-class', 'plus-class', 'minus-class'],
  props: {
    integer: Boolean, //父页面传值
    disabled: Boolean,
    disableInput: Boolean,//父页面传值
    min: {//父页面传值
      type: null,
      value: 1
    },
    max: {//父页面传值
      type: null,
      value: MAX
    },
    step: {
      type: null,
      value: 1
    },
    canUse: Boolean
  },
  computed: {
    minusDisabled: function minusDisabled() {
      return this.data.disabled || this.data.value <= this.data.min;
    },
    plusDisabled: function plusDisabled() {
      return this.data.disabled || this.data.value >= this.data.max;
    }
  },
  created: function created() {
    this.setData({
      value: this.range(this.data.value)
    });
  },
  methods: {
    // limit value range
    range: function range(value) {
      return Math.max(Math.min(this.data.max, value), this.data.min);
    },
    onInput: function onInput(event) {
      var _ref = event.detail || {},
          _ref$value = _ref.value,
          value = _ref$value === void 0 ? '' : _ref$value;

      this.triggerInput(value);
    },
    onChange: function onChange(type) {
      if (this.data[type + "Disabled"]) {
        this.$emit('overlimit', type);
        return;
      }

      var diff = type === 'minus' ? -this.data.step : +this.data.step;
      var value = Math.round((this.data.value + diff) * 100) / 100;
      this.triggerInput(this.range(value));
      // this.$emit(type);

      //test
      this.$emit(type,value);
    },
    onBlur: function onBlur(event) {
      var value = this.range(this.data.value);
      this.triggerInput(value);
      this.$emit('blur', event);
    },
    onMinus: function onMinus() {
      
      if (!this.data.canUse) {
        this.onChange('minus');
      }
      
    },
    onPlus: function onPlus() {
      if (!this.data.canUse) {
        this.onChange('plus');
      }
    },
    triggerInput: function triggerInput(value) {
      //修改data，把值传给父页面
      this.setData({
        value: value
      });
      this.$emit('change', value);
    }
  }
});