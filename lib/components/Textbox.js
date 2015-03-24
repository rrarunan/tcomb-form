'use strict';

var React = require('react');
var t = require('tcomb-validation');
var api = require('../api');
var skin = require('../skin');
var compile = require('uvdom/react').compile;
var extend = require('../util/extend');
var Component = require('./Component');
var debug = require('debug')('component:Textbox');

function Textbox(props) {
  Component.call(this, props);
}

extend(Textbox, Component);

Textbox.prototype.getStateValue = function (value) {
  return (t.Str.is(value) && value.trim() === '') ? null :
    !t.Nil.is(value) ? value :
    null;
};

Textbox.prototype.getTemplate = function () {
  return this.props.options.template || this.props.ctx.templates.textbox;
};

Textbox.prototype.getLocals = function () {
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
    placeholder: this.getPlaceholder(),
    type: this.props.options.type || 'text',
    value: this.getFormattedValue(),
    template: this.getTemplate(),
    className: this.props.options.className
  };
};

Textbox.prototype.render = function () {
  new api.Textbox(this.props.options);
  var locals = this.getLocals();
  debug('render() called for `%s` field', locals.name);
  return compile(locals.template(new skin.Textbox(locals)));
};

module.exports = Textbox;