import { basic } from '../mixins/basic'; //组件将要继承的一些基础属性和方法。
import { observe } from '../mixins/observer/index'; //为自定义组件添加监听方法 watch和computed
// console.log(basic)

function mapKeys(source, target, map) {
  Object.keys(map).forEach(function (key) {
    if (source[key]) {
      target[map[key]] = source[key];
    }
  });
}

function VantComponent(vantOptions) {
  // console.log(vantOptions)
  if (vantOptions === void 0) {
    vantOptions = {};
  }

  var options = {};
  mapKeys(vantOptions, options, {
    data: 'data',
    props: 'properties',
    mixins: 'behaviors',
    methods: 'methods',
    beforeCreate: 'created',
    created: 'attached',
    mounted: 'ready',
    relations: 'relations',
    destroyed: 'detached',
    classes: 'externalClasses'
  });
  //用mapKeys方法将各个组件的所有内容赋值给options

  var _vantOptions = vantOptions,
      relation = _vantOptions.relation;
  // console.log(relation);
  if (relation) {
    options.relations = Object.assign(options.relations || {}, {
      ["../" + relation.name + "/index"]: relation
    });
  } // add default externalClasses


  options.externalClasses = options.externalClasses || [];
  options.externalClasses.push('custom-class'); // add default behaviors
  // console.log(options.externalClasses)
  
  options.behaviors = options.behaviors || [];
  //相当于组件内写 behaviors: [basic]
  options.behaviors.push(basic); // map field to form-field behavior

  // console.log(vantOptions.field);
  if (vantOptions.field) {
    options.behaviors.push('wx://form-field'); //一个内置 behavior ，它使得这个自定义组件有类似于表单控件的行为
  } // add default options


  options.options = {
    multipleSlots: true, // 在组件定义时的选项中启用多slot支持
    addGlobalClass: true
  };
  // console.log(vantOptions);
  // console.log(options);
  /**
   * vantOptions组件的所有参数
   * options 经过解析后的参数
   */
  observe(vantOptions, options);
  //调用Component构造器
  Component(options);
}

export { VantComponent };