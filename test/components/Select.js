'use strict';

var test = require('tape');
var React = require('react');
var t = require('../../.');
var Select = require('../../lib/components/Select');
var bootstrap = require('../../lib/skins/bootstrap');
var util = require('./util');
var vdom = require('react-vdom');

var getLocals = util.getLocalsFactory(Select);
var getValue = util.getValueFactory(Select, bootstrap.select);

var Country = t.enums({
  IT: 'Italy',
  US: 'United States',
  FR: 'France'
}, 'Country');

test('Select', function (tape) {

  tape.test('className', function (tape) {
    tape.plan(1);

    tape.strictEqual(
      getLocals({type: Country}, {className: 'myClassName'}).className,
      'myClassName',
      'should handle className option');

  });

  tape.test('disabled', function (tape) {
    tape.plan(3);

    tape.strictEqual(
      getLocals({type: Country}).disabled,
      undefined,
      'default disabled should be undefined');

    tape.strictEqual(
      getLocals({type: Country}, {disabled: true}).disabled,
      true,
      'should handle disabled = true');

    tape.strictEqual(
      getLocals({type: Country}, {disabled: false}).disabled,
      false,
      'should handle disabled = false');
  });

  tape.test('label', function (tape) {
    tape.plan(5);

    tape.strictEqual(
      getLocals({type: Country}).label,
      undefined,
      'should default to undefined');

    tape.strictEqual(
      getLocals({type: Country, label: 'defaultLabel', auto: 'labels'}).label,
      'defaultLabel',
      'should have a default label if ctx.auto === `labels`');

    tape.strictEqual(
      getLocals({type: t.maybe(Country), label: 'defaultLabel', auto: 'labels'}).label,
      'defaultLabel (optional)',
      'should handle optional types if ctx.auto === `labels`');

    tape.strictEqual(
      getLocals({type: Country}, {label: 'mylabel'}).label,
      'mylabel',
      'should handle label as strings');

    tape.deepEqual(
      vdom(getLocals({type: Country}, {label: React.DOM.i(null, 'JSX label')}).label),
      {tag: 'i', attrs: {}, children: 'JSX label'},
      'should handle label as JSX');

  });

  tape.test('help', function (tape) {
    tape.plan(2);

    tape.strictEqual(
      getLocals({type: Country}, {help: 'mylabel'}).help,
      'mylabel',
      'should handle help as strings');

    tape.deepEqual(
      vdom(getLocals({type: Country}, {help: React.DOM.i(null, 'JSX label')}).help),
      {tag: 'i', attrs: {}, children: 'JSX label'},
      'should handle help as JSX');
  });

  tape.test('name', function (tape) {
    tape.plan(2);

    tape.ok(
      t.Str.is(getLocals({type: Country}).name),
      'should have a default name');

    tape.strictEqual(
      getLocals({type: Country}, {name: 'myname'}).name,
      'myname',
      'should handle name as strings');

  });

  tape.test('value', function (tape) {
    tape.plan(3);

    tape.strictEqual(
      getLocals({type: Country}).value,
      null,
      'default value should be null');

    tape.strictEqual(
      getLocals({type: Country}, {}, 'IT').value,
      'IT',
      'should handle value prop');

    tape.deepEqual(
      getLocals({type: t.list(Country)}, {}, ['IT', 'US']).value,
      ['IT', 'US'],
      'should handle multiple selectes');

  });

  tape.test('hasError', function (tape) {
    tape.plan(2);

    tape.strictEqual(
      getLocals({type: Country}).hasError,
      false,
      'default hasError should be false');

    tape.strictEqual(
      getLocals({type: Country}, {hasError: true}).hasError,
      true,
      'should handle hasError option');
  });

  tape.test('error', function (tape) {
    tape.plan(4);

    tape.strictEqual(
      getLocals({type: Country}).error,
      undefined,
      'default error should be undefined');

    tape.strictEqual(
      getLocals({type: Country}, {error: 'myerror'}).error,
      'myerror',
      'should handle error option as string');

    tape.deepEqual(
      vdom(getLocals({type: Country}, {error: React.DOM.i(null, 'JSX label')}).error),
      {tag: 'i', attrs: {}, children: 'JSX label'},
      'should handle error option as JSX');

    tape.strictEqual(
      getLocals({type: Country}, {error: function (value) {
        return 'error: ' + value;
      }}, 'IT').error,
      'error: IT',
      'should handle error option as a function');
  });

  tape.test('template', function (tape) {
    tape.plan(3);

    tape.strictEqual(
      getLocals({type: Country}).template,
      bootstrap.select,
      'default template should be bootstrap.select');

    var template = function () {};

    tape.strictEqual(
      getLocals({type: Country}, {template: template}).template,
      template,
      'should handle template option');

    tape.strictEqual(
      getLocals({type: Country, templates: {select: template}}).template,
      template,
      'should handle context templates');

  });

  tape.test('id', function (tape) {
    tape.plan(3);

    tape.strictEqual(
      getLocals({type: Country}).id.substr(8, 1),
      '-',
      'default id should be a uuid');

    tape.strictEqual(
      getLocals({type: Country}, {id: 'myid'}).id,
      'myid',
      'should handle id option');

    tape.strictEqual(
      getLocals({type: Country}, {id: 'myid'}).name,
      'myid',
      'should use id as default name');

  });

  tape.test('autoFocus', function (tape) {
    tape.plan(2);

    tape.strictEqual(
      getLocals({type: Country}).autoFocus,
      undefined,
      'default autoFocus should be undefined');

    tape.strictEqual(
      getLocals({type: Country}, {autoFocus: true}).autoFocus,
      true,
      'should handle autoFocus option');

  });

  tape.test('options', function (tape) {
    tape.plan(2);

    tape.deepEqual(
      getLocals({type: Country}).options,
      [
        {value: '', text: '-'},
        {value: 'IT', text: 'Italy'},
        {value: 'US', text: 'United States'},
        {value: 'FR', text: 'France'}
      ],
      'should retrieve options from the enum');

    tape.deepEqual(
      getLocals({type: Country}, {options: [
        {value: 'IT', text: 'Italia'},
        {value: 'US', text: 'Stati Uniti'}
      ]}).options,
      [
        {value: '', text: '-'},
        {value: 'IT', text: 'Italia'},
        {value: 'US', text: 'Stati Uniti'}
      ],
      'should handle `option` option');

  });

  tape.test('order', function (tape) {
    tape.plan(2);

    tape.deepEqual(
      getLocals({type: Country}, {order: 'asc'}).options,
      [
        {value: '', text: '-'},
        {value: 'FR', text: 'France'},
        {value: 'IT', text: 'Italy'},
        {value: 'US', text: 'United States'}
      ],
      'should handle asc order option');

    tape.deepEqual(
      getLocals({type: Country}, {order: 'desc'}).options,
      [
        {value: '', text: '-'},
        {value: 'US', text: 'United States'},
        {value: 'IT', text: 'Italy'},
        {value: 'FR', text: 'France'}
      ],
      'should handle desc order option');

  });

  tape.test('nullOption', function (tape) {
    tape.plan(2);

    tape.deepEqual(
      getLocals({type: Country}, {nullOption: {value: '-1', text: 'my text'}}).options,
      [
        {value: '-1', text: 'my text'},
        {value: 'IT', text: 'Italy'},
        {value: 'US', text: 'United States'},
        {value: 'FR', text: 'France'}
      ],
      'should add the nullOption in first position');

    tape.deepEqual(
      getLocals({type: Country}, {nullOption: false}).options,
      [
        {value: 'IT', text: 'Italy'},
        {value: 'US', text: 'United States'},
        {value: 'FR', text: 'France'}
      ],
      'should handle nullOption = false');

  });

  tape.test('multiple', function (tape) {
    tape.plan(1);

    tape.strictEqual(
      getLocals({type: t.list(Country)}).multiple,
      true,
      'should be multiple if type is a list of enums');

  });

  if (typeof window !== 'undefined') {

    tape.test('getValue', function (tape) {
        tape.plan(16);

        getValue(function (result) {
          tape.strictEqual(result.isValid(), true);
          tape.strictEqual(result.value, 'IT');
        }, function (locals) {
            tape.strictEqual(locals.hasError, false);
            tape.strictEqual(locals.value, 'IT');
        }, {type: Country}, null, 'IT');

        getValue(function (result) {
          tape.strictEqual(result.isValid(), false);
          tape.strictEqual(result.value, null);
        }, function (locals, rendered) {
          if (rendered) {
            tape.strictEqual(locals.hasError, true);
            tape.strictEqual(locals.value, null);
          }
        }, {type: Country});

        getValue(function (result) {
          tape.strictEqual(result.isValid(), true);
          tape.strictEqual(result.value, null);
        }, function (locals) {
            tape.strictEqual(locals.hasError, false);
            tape.strictEqual(locals.value, null);
        }, {type: t.maybe(Country)});

        getValue(function (result) {
          tape.strictEqual(result.isValid(), true);
          tape.deepEqual(result.value, ['IT', 'US']);
        }, function (locals) {
          tape.strictEqual(locals.hasError, false);
          tape.deepEqual(locals.value, ['IT', 'US']);
        }, {type: t.list(Country)}, null, ['IT', 'US']);

    });

  }

});


