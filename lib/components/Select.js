'use strict';

var React = require('react');
var t = require('tcomb-validation');
var api = require('../api');
var skin = require('../skin');
var compile = require('uvdom/react').compile;
var extend = require('../util/extend');
var getOptionsOfEnum = require('../util/getOptionsOfEnum');
var getReport = require('../util/getReport');
var Component = require('./Component');
var debug = require('debug')('component:Select');

function Select(props) {
  Component.call(this, props);
}

extend(Select, Component);

Select.prototype.getStateValue = function (value) {
  return t.maybe(api.SelectValue)(value);
};

Select.prototype.getEnum = function () {
  var Enum = this.props.ctx.report.innerType;
  return this.isMultiple() ? getReport(Enum.meta.type).innerType : Enum;
};

Select.prototype.isMultiple = function () {
  var Enum = this.props.ctx.report.innerType;
  return Enum.meta.kind === 'list';
};

Select.prototype.getNullOption = function () {
  return this.props.options.nullOption || {value: '', text: '-'};
};

Select.prototype.getOptions = function () {
  var options = this.props.options.options ? this.props.options.options.slice() : getOptionsOfEnum(this.getEnum());
  // sort opts
  if (this.props.options.order) {
    options.sort(api.Order.getComparator(this.props.options.order));
  }
  // add a `null` option in first position
  var nullOption = this.getNullOption();
  if (!this.isMultiple() && this.props.options.nullOption !== false) {
    options.unshift(nullOption);
  }
  return options;
};

Select.prototype.getTemplate = function () {
  return this.props.options.template || this.props.ctx.templates.select;
};

Select.prototype.onChange = function (value) {
  if (value === this.getNullOption().value) {
    value = null;
  }
  Component.prototype.onChange.call(this, value);
};

Select.prototype.getLocals = function () {
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
    multiple: this.isMultiple(),
    onChange: this.onChange.bind(this),
    options: this.getOptions(),
    value: this.getFormattedValue(),
    template: this.getTemplate(),
    className: this.props.options.className
  };
};

Select.prototype.render = function () {
  new api.Select(this.props.options);
  var locals = this.getLocals();
  debug('render() called for `%s` field', locals.name);
  return compile(locals.template(new skin.Select(locals)));
};

module.exports = Select;