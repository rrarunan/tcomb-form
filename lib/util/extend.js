'use strict';

function extend(Child, Parent) {
  for (var key in Parent) {
    if (Parent.hasOwnProperty(key)) {
      Child[key] = Parent[key];
    }
  }
  var superproto = Parent === null ? null : Parent.prototype;
  Child.prototype = Object.create(superproto);
  Child.prototype.constructor = Child;
}

module.exports = extend;