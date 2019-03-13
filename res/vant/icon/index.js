import { VantComponent } from '../common/component';
VantComponent({
  props: {
    info: null,
    name: String,
    size: String,
    color: String,
    customStyle: String,
    classPrefix: {
      type: String,
      value: 'van-icon'
    }
  },
  methods: {
    onClick: function onClick(event) {
      // console.log(event)
      this.$emit('click');
    }
  }
});