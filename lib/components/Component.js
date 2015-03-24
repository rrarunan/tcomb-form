'use strict';

var React = require('react');
var t = require('tcomb-validation');
var merge = require('../util/merge');
var uuid = require('../util/uuid');
var extend = require('../util/extend');

function Component(props) {
  React.Component.call(this, props);
  this.state = {
    hasError: false,
    value: this.getStateValue(this.props.value)
  };
}

extend(Component, React.Component);

Component.defaultProps = {options: {}};

Component.prototype.getStateValue = function (value) {
  return value;
};

Component.prototype.componentWillReceiveProps = function (props) {
  this.setState({value: this.getStateValue(props.value)});
};

Component.prototype.shouldComponentUpdate = function (nextProps, nextState) {
  return nextState.value !== this.state.value ||
    nextState.hasError !== this.state.hasError ||
    nextProps.value !== this.props.value ||
    nextProps.options !== this.props.options ||
    nextProps.ctx.report.type !== this.props.ctx.report.type;
};

Component.prototype.getValue = function () {
  var result = t.validate(this.state.value, this.props.ctx.report.type);
  this.setState({hasError: !result.isValid()});
  return result;
};

Component.prototype.getParsedValue = function (value) {
  var transformer = this.getTransformer();
  if (transformer) {
    value = transformer.parse(value);
  }
  return value;
};

Component.prototype.onChange = function (value) {
  value = this.getParsedValue(value);
  value = this.getStateValue(value);
  this.setState({value: value}, function () {
    this.props.onChange(value);
  }.bind(this));
};

Component.prototype.getId = function () {
  return this.props.options.id || this._rootNodeID || uuid();
};

Component.prototype.getName = function () {
  return this.props.options.name || this.props.ctx.name || this.getId();
};

Component.prototype.getLabel = function () {
  var label = this.props.options.label; // always use the option value if is manually set
  if (!label && this.props.ctx.auto === 'labels') {
    // add automatically a label only if there is not a label
    // and the 'labels' auto option is turned on
    label = this.props.ctx.getDefaultLabel();
  }
  return label;
};

Component.prototype.getPlaceholder = function () {
  var placeholder = this.props.options.placeholder; // always use the option value if is manually set
  if (!this.getLabel() && !placeholder && this.props.ctx.auto === 'placeholders') {
    // add automatically a placeholder only if there is not a label
    // nor a placeholder manually set and the 'placeholders' auto option is turned on
    placeholder = this.props.ctx.getDefaultLabel();
  }
  return placeholder;
};

Component.prototype.getTransformer = function () {
  return this.props.options.transformer || require('../config').transformers[t.getTypeName(this.props.ctx.report.innerType)];
};

Component.prototype.getConfig = function () {
  return merge(this.props.ctx.config, this.props.options.config);
};

Component.prototype.getError = function () {
  var error = this.props.options.error;
  return t.Func.is(error) ? error(this.state.value) : error;
};

Component.prototype.hasError = function () {
  return this.props.options.hasError || this.state.hasError;
};

Component.prototype.getFormattedValue = function () {
  var value = this.state.value;
  var transformer = this.getTransformer();
  if (transformer) {
    value = transformer.format(value);
  }
  return value;
};

module.exports = Component;