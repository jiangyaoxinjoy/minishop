import { VantComponent } from '../common/component';
import { link } from '../mixins/link';
import { button } from '../mixins/button';
import { openType } from '../mixins/open-type';
VantComponent({
  mixins: [link, button, openType],
  props: {
    text: String,
    loading: Boolean,
    disabled: Boolean,
    type: {
      type: String,
      value: 'danger'
    }
  },
  methods: {
    onClick: function onClick(event) {
      // console.log(event.detail);
      this.$emit('click', event.detail);
      this.jumpLink();
    }
  }
});