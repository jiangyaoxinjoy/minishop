import { VantComponent } from '../common/component';
VantComponent({
  field: true,
  classes: ['cancel-class'],
  props: {
    focus: Boolean,
    error: Boolean, 
    disabled: Boolean, 
    readonly: Boolean, 
    inputAlign: String,
    showAction: Boolean,
    useActionSlot: Boolean,
    placeholder: String,
    placeholderStyle: String,
    background: {
      type: String,
      value: '#f2f2f2'
    },
    maxlength: {
      type: Number,
      value: -1
    },
    inputStyle:String
  },
  methods: {
    //onChange接收field传值，input的值
    onChange: function onChange(event) {
      this.setData({
        value: event.detail
      });
      //又将值传给主页面
      this.$emit('change', event.detail);
    },
    onCancel: function onCancel() {
      this.setData({
        value: ''
      });
      this.$emit('cancel');
      this.$emit('change', '');
    },
    onSearch: function onSearch() {
      this.$emit('search', this.data.value);
    },
    onFocus: function onFocus() {
      this.$emit('focus');
    },
    onBlur: function onBlur() {
      this.$emit('blur');
    }
  }
});