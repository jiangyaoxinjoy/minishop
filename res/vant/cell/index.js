import { link } from '../mixins/link';
import { VantComponent } from '../common/component';

//调用Component构造器
VantComponent({
  classes: ['title-class', 'label-class', 'value-class'],
  mixins: [link],
  props: { //properties组件的对外属性
    title: null,
    value: null,
    icon: String,
    label: String,
    center: Boolean,
    isLink: Boolean,
    required: Boolean,
    clickable: Boolean,
    titleWidth: String,
    customStyle: String,
    border: {
      type: Boolean,
      value: true
    }
  },
  computed: {
    //计算出类名和title的样式
    cellClass: function cellClass() {
      var data = this.data;
      //custom-class是外部样式类，外部没有定义这个样式的话是不会显示在样式类别的
      return this.classNames('custom-class', 'van-cell', {
        'van-cell--center': data.center,
        'van-cell--required': data.required,
        'van-cell--borderless': !data.border,
        'van-cell--clickable': data.isLink || data.clickable
      });
    },
    titleStyle: function titleStyle() {
      var titleWidth = this.data.titleWidth;
      // console.log(titleWidth )
      return titleWidth ? "max-width: " + titleWidth + ";min-width: " + titleWidth : '';
    }
  },
  methods: {
    onClick: function onClick(event) {
      console.log(event.detail);
      this.$emit('click', event.detail);
      this.jumpLink();
    }
  }
});