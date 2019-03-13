import { behavior } from './behavior';
import { observeProps } from './props';
export function observe(vantOptions, options) {
  var watch = vantOptions.watch,
      computed = vantOptions.computed;
  // console.log(computed);
  if (watch) {
    var props = options.properties || {};
    Object.keys(watch).forEach(function (key) {
      // console.log(watch);
      if (key in props) {
        var prop = props[key];

        if (prop === null || !('type' in prop)) {
          prop = {
            type: prop
          };
        }
        // console.log(prop)
        //为每个要watch的参数添加observer方法
        //observer是自带的，属性被改变时执行的函数
        prop.observer = watch[key];
        props[key] = prop;
      }
    });
    options.properties = props;
  }

  if (computed) {
    options.behaviors.push(behavior);
    options.methods = options.methods || {};

    //$options 等于 组件的所有参数
    options.methods.$options = function () {
      return vantOptions;
    };

    // options.properties组件解析后的参数
    if (options.properties) {
      // console.log(options.properties)
      // console.log(options.methods.$options())
      observeProps(options.properties);
    }
  }
}