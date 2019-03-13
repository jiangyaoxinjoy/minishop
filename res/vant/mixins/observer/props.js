export function observeProps(props) {
  if (!props) {
    return;
  }

  Object.keys(props).forEach(function (key) {
    var prop = props[key];
  
    // console.log(prop === null || !('type' in prop))
    if (prop === null || !('type' in prop)) {
      
      prop = {
        type: prop
      };
    }

    var _prop = prop,
        observer = _prop.observer;

    prop.observer = function () {
      // console.log(observer)
      if (observer) {
        if (typeof observer === 'string') {
          observer = this[observer];
        }

        observer.apply(this, arguments);
      }
      this.setData();
    };

    props[key] = prop;
  });
}