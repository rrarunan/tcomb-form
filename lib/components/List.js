'use strict';

var React = require('react');
var t = require('tcomb-validation');
var api = require('../api');
var skin = require('../skin');
var compile = require('uvdom/react').compile;
var merge = require('../util/merge');
var extend = require('../util/extend');
var move = require('../util/move');
var uuid = require('../util/uuid');
var getComponent = require('../getComponent');
var getReport = require('../util/getReport');
var Component = require('./Component');
var debug = require('debug')('component:List');

function justify(value, keys) {
  if (value.length === keys.length) { return keys; }
  var ret = [];
  for (var i = 0, len = value.length ; i < len ; i++ ) {
    ret[i] = keys[i] || uuid();
  }
  return ret;
}

function List(props) {
  Component.call(this, props);
  this.state.keys = this.state.value.map(uuid);
}

extend(List, Component);

List.prototype.getStateValue = function (value) {
  t.maybe(t.Arr)(value);
  return value || [];
};

List.prototype.onChange = function(value, keys) {
  this.setState({value: value, keys: keys}, function () {
    this.props.onChange(value);
  }.bind(this));
};

List.prototype.getValue = function () {
  var report = this.props.ctx.report;
  var value = [];
  var errors = [];
  var hasError = false;
  var result;

  for (var i = 0, len = this.state.value.length ; i < len ; i++ ) {
    result = this.refs[i].getValue();
    errors = errors.concat(result.errors);
    value.push(result.value);
  }

  // handle subtype
  if (report.subtype && errors.length === 0) {
    result = t.validate(value, report.type);
    hasError = !result.isValid();
    errors = errors.concat(result.errors);
  }

  this.setState({hasError: hasError});
  return new t.ValidationResult({errors: errors, value: value});
};

List.prototype.addItem = function (evt) {
  evt.preventDefault();
  var value = this.state.value.concat(null);
  var keys = this.state.keys.concat(uuid());
  this.onChange(value, keys);
};

List.prototype.onItemChange = function (itemIndex, itemValue) {
  var value = this.state.value.slice();
  value[itemIndex] = itemValue;
  this.onChange(value, this.state.keys);
};

List.prototype.removeItem = function (i, evt) {
  evt.preventDefault();
  var value = this.state.value.slice();
  value.splice(i, 1);
  var keys = this.state.keys.slice();
  keys.splice(i, 1);
  this.onChange(value, keys);
};

List.prototype.moveUpItem = function (i, evt) {
  evt.preventDefault();
  if (i > 0) {
    this.onChange(
      move(this.state.value.slice(), i, i - 1),
      move(this.state.keys.slice(), i, i - 1)
    );
  }
};

List.prototype.moveDownItem = function (i, evt) {
  evt.preventDefault();
  if (i < this.state.value.length - 1) {
    this.onChange(
      move(this.state.value.slice(), i, i + 1),
      move(this.state.keys.slice(), i, i + 1)
    );
  }
};

List.prototype.getI18n = function () {
  return this.props.options.i18n || this.props.ctx.i18n;
};

List.prototype.getTemplates = function () {
  return merge(this.props.ctx.templates, this.props.options.templates);
};

List.prototype.getItems = function () {
  var auto = this.getAuto();
  var templates = this.getTemplates();
  var value = this.getFormattedValue();
  var name = this.props.ctx.name;
  var config = this.getConfig();
  var i18n =  this.getI18n();
  var itemType = this.props.ctx.report.innerType.meta.type;
  var factory = React.createFactory(getComponent(itemType, this.props.options.item));
  var items = value.map(function (value, i) {
    var buttons = [];
    if (!this.props.options.disableRemove) { buttons.push({ label: i18n.remove, click: this.removeItem.bind(this, i) }); }
    if (!this.props.options.disableOrder)   { buttons.push({ label: i18n.up, click: this.moveUpItem.bind(this, i) }); }
    if (!this.props.options.disableOrder)   { buttons.push({ label: i18n.down, click: this.moveDownItem.bind(this, i) }); }
    return {
      input: factory({
        ref: i,
        type: itemType,
        options: this.props.options.item,
        value: value,
        onChange: this.onItemChange.bind(this, i),
        ctx: new api.Context({
          auto:       auto,
          config:     config,
          i18n:       i18n,
          label:      null,
          name:       name + '[' + i + ']',
          report:     new getReport(itemType),
          templates:  templates
        })
      }),
      key: this.state.keys[i],
      buttons: buttons
    };
  }.bind(this));
  return items;
};

List.prototype.getAuto = function () {
  return this.props.options.auto || this.props.ctx.auto;
};

List.prototype.getLegend = function () {
  var legend = this.props.options.legend; // always use the option value if is manually set
  if (!legend && this.getAuto() === 'labels') {
    // add automatically a legend only if there is not a legend
    // and the 'labels' auto option is turned on
    legend = this.props.ctx.getDefaultLabel();
  }
  return legend;
};

List.prototype.getLocals = function () {
  var i18n = this.getI18n();
  return {
    add: this.props.options.disableAdd ? null : {
      label: i18n.add,
      click: this.addItem.bind(this)
    },
    config: this.getConfig(),
    disabled: this.props.options.disabled,
    error: this.getError(),
    hasError: this.hasError(),
    help: this.props.options.help,
    items: this.getItems(),
    legend: this.getLegend(),
    value: this.getFormattedValue(),
    templates: this.getTemplates(),
    className: this.props.options.className
  };
};

List.prototype.render = function () {
  new api.List(this.props.options);
  var locals = this.getLocals();
  debug('render() called for `%s` field', locals.name || 'top level');
  return compile(locals.templates.list(new skin.List(locals)));
};

module.exports = List;