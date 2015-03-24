'use strict';

var t = require('tcomb-validation');
var api = require('../api');
var skin = require('../skin');
var compile = require('uvdom/react').compile;
var extend = require('../util/extend');
var Component = require('./Component');
var debug = require('debug')('component:Checkbox');

function Checkbox(props) {
  Component.call(this, props);
}

extend(Checkbox, Component);

Checkbox.prototype.getStateValue = function (value) {
  return !!t.maybe(t.Bool)(value);
};

Checkbox.prototype.getTemplate = function () {
  return this.props.options.template || this.props.ctx.templates.checkbox;
};

Checkbox.prototype.getLabel = function () {
  return Component.prototype.getLabel.call(this) || this.props.ctx.getDefaultLabel(); // checkboxes must have a label
};

Checkbox.prototype.getLocals = function () {
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
    value: this.getFormattedValue(),
    template: this.getTemplate(),
    className: this.props.options.className
  };
};

Checkbox.prototype.render = function () {
  api.Checkbox(this.props.options);
  var locals = this.getLocals();
  debug('render() called for `%s` field', locals.name);
  return compile(locals.template(new skin.Checkbox(locals)));
};

module.exports = Checkbox;