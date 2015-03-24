'use strict';

var React = require('react');
var t = require('tcomb-validation');
var api = require('../api');
var skin = require('../skin');
var compile = require('uvdom/react').compile;
var extend = require('../util/extend');
var getComponent = require('../getComponent');
var merge = require('../util/merge');
var humanize = require('../util/humanize');
var getReport = require('../util/getReport');
var Component = require('./Component');
var debug = require('debug')('component:Struct');

function Struct(props) {
  Component.call(this, props);
}

extend(Struct, Component);

Struct.prototype.getStateValue = function (value) {
  t.maybe(t.Obj)(value);
  return value || {};
};

Struct.prototype.getTypeProps = function () {
  return this.props.ctx.report.innerType.meta.props;
};

Struct.prototype.getOrder = function () {
  return this.props.options.order || Object.keys(this.getTypeProps());
};

Struct.prototype.getAuto = function () {
  return this.props.options.auto || this.props.ctx.auto;
};

Struct.prototype.getTemplates = function () {
  return merge(this.props.ctx.templates, this.props.options.templates);
};

Struct.prototype.getI18n = function () {
  return this.props.options.i18n || this.props.ctx.i18n;
};

Struct.prototype.onChange = function (fieldName, fieldValue) {
  var value = t.mixin({}, this.state.value);
  value[fieldName] = fieldValue;
  this.setState({value: value}, function () {
    this.props.onChange(value);
  }.bind(this));
};

Struct.prototype.getValue = function () {
  var report = this.props.ctx.report;
  var value = {};
  var errors = [];
  var hasError = false;
  var result;

  for (var ref in this.refs) {
    if (this.refs.hasOwnProperty(ref)) {
      result = this.refs[ref].getValue();
      errors = errors.concat(result.errors);
      value[ref] = result.value;
    }
  }

  if (errors.length === 0) {
    value = new report.innerType(value);
    // handle subtype
    if (report.subtype && errors.length === 0) {
      result = t.validate(value, report.type);
      hasError = !result.isValid();
      errors = errors.concat(result.errors);
    }
  }

  this.setState({hasError: hasError});
  return new t.ValidationResult({errors: errors, value: value});
};

Struct.prototype.getInputs = function () {
  var auto = this.getAuto();
  var name = this.props.ctx.name;
  var value = this.getFormattedValue();
  var props = this.getTypeProps();
  var config = this.getConfig();
  var i18n =  this.getI18n();
  var templates = this.getTemplates();
  var inputs = {};
  for (var prop in props) {
    if (props.hasOwnProperty(prop)) {
      var propType = props[prop];
      var propOptions = this.props.options.fields ? this.props.options.fields[prop] : undefined;
      inputs[prop] = React.createFactory(getComponent(propType, propOptions))({
        key: prop,
        ref: prop,
        type: propType,
        options: propOptions,
        value: value[prop],
        onChange: this.onChange.bind(this, prop),
        ctx: new api.Context({
          auto:       auto,
          config:     config,
          i18n:       i18n,
          label:      humanize(prop),
          name:       name ? name + '[' + prop + ']' : prop,
          report:     new getReport(propType),
          templates:  templates
        })
      });
    }
  }
  return inputs;
};

Struct.prototype.getLegend = function () {
  var legend = this.props.options.legend; // always use the option value if is manually set
  if (!legend && this.getAuto() === 'labels') {
    // add automatically a legend only if there is not a legend
    // and the 'labels' auto option is turned on
    legend = this.props.ctx.getDefaultLabel();
  }
  return legend;
};

Struct.prototype.getLocals = function () {
  return {
    config: this.getConfig(),
    disabled: this.props.options.disabled,
    error: this.getError(),
    hasError: this.hasError(),
    help: this.props.options.help,
    inputs: this.getInputs(),
    legend: this.getLegend(),
    order: this.getOrder(),
    value: this.getFormattedValue(),
    templates: this.getTemplates(),
    className: this.props.options.className
  };
};

Struct.prototype.render = function () {
  new api.Struct(this.props.options);
  var locals = this.getLocals();
  debug('render() called for `%s` field', locals.name || 'top level');
  return compile(locals.templates.struct(new skin.Struct(locals)));
};

module.exports = Struct;