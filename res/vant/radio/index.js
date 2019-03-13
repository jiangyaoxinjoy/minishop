import { VantComponent } from '../common/component';
VantComponent({
  field: true,
  relation: {
    name: 'radio-group',
    type: 'ancestor' // 关联的目标节点应为祖先节点
  },
  classes: ['icon-class', 'label-class'],
  props: {
    name: null, //主页面传值
    value: null, //父组件传值
    disabled: Boolean, //主页面传值
    labelDisabled: Boolean, //未指定初始值，初始化为false
    labelPosition: String,
    goods:String
  },
  /**
   * computed
   * 每次setData修改数据后回调函数计算值是否改变
   */
  computed: {
    iconClass: function iconClass() { 
      var _this$data = this.data,
          disabled = _this$data.disabled,
          name = _this$data.name,
          value = _this$data.value;
      // console.log(this);    
      // console.log('eee' + this.data.value)
      // console.log('eee')
      // console.log(this.data);
      return this.classNames('van-radio__icon', {
        'van-radio__icon--disabled': disabled,
        'van-radio__icon--checked': !disabled && name === value,
        'van-radio__icon--check': !disabled && name !== value,
      });
    },
    // test: function test() {
    //   console.log('test')
    //   console.log(this.data.value)
    // }
  },
  methods: {
    emitChange: function emitChange(value) {
      var instance = this.getRelationNodes('../radio-group/index')[0] || this;
      // console.log(value);
      // 父组件传值到父页面 
      instance.$emit('input', value);
      instance.$emit('change', value);
    },
    onChange: function onChange(event) {
      // console.log(event) 
      //radio发生change事件，所以不用判断 this.data.disabled。因为如果this.data.disabled，radio值无法change。  
      this.emitChange(event.detail.value);
    },
    onClickLabel: function onClickLabel() {
      if (!this.data.disabled && !this.data.labelDisabled) {
        this.emitChange(this.data.name);
      }
    }
  }
});