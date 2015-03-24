'use strict';

var t = require('tcomb-validation');
var api = require('../api');
var skin = require('../skin');
var compile = require('uvdom/react').compile;
var extend = require('../util/extend');
var getOptionsOfEnum = require('../util/getOptionsOfEnum');
var Component = require('./Component');
var debug = require('debug')('component:Radio');

function Radio(props) {
  Component.call(this, props);
}

extend(Radio, Component);

Radio.prototype.getStateValue = function (value) {
  return t.maybe(api.SelectValue)(value);
};

Radio.prototype.getEnum = function () {
  return this.props.ctx.report.innerType;
};

Radio.prototype.getOptions = function () {
  var options = this.props.options.options ? this.props.options.options.slice() : getOptionsOfEnum(this.getEnum());
  // sort opts
  if (this.props.options.order) {
    options.sort(api.Order.getComparator(this.props.options.order));
  }
  return options;
};

Radio.prototype.getTemplate = function () {
  return this.props.options.template || this.props.ctx.templates.radio;
};

Radio.prototype.getLocals = function () {
  return {
    autoFocus: this.props.options.autoFocus,
    config: this.getConfig(),
    disabled: this.props.options.disabled,
    error: this.getError(),
    hasError: this.hasError(),
    help: this.props.options.help,
    id: this.getId(),
    label: this.getLabel(),
    name: this.getName(),
    onChange: this.onChange.bind(this),
    options: this.getOptions(),
    value: this.getFormattedValue(),
    template: this.getTemplate(),
    className: this.props.options.className
  };
};

Radio.prototype.render = function () {
  api.Radio(this.props.options);
  var locals = this.getLocals();
  debug('render() called for `%s` field', locals.name);
  return compile(locals.template(new skin.Radio(locals)));
};

module.exports = Radio;