'use strict';

var test = require('tape');
var React = require('react');
var t = require('../../.');
var Struct = require('../../lib/components/Struct');
var bootstrap = require('../../lib/skins/bootstrap');
var util = require('./util');
var vdom = require('react-vdom');

var getLocals = util.getLocalsFactory(Struct);
var getValue = util.getValueFactory(Struct, bootstrap.struct);

var Country = t.enums({
  IT: 'Italy',
  US: 'United States'
}, 'Country');

var Gender = t.enums({
  M: 'Male',
  F: 'Female'
}, 'Gender');

var Person = t.struct({
  name: t.Str,
  rememberMe: t.Bool,
  country: Country,
  gender: Gender
});

test('Struct', function (tape) {

  tape.test('className', function (tape) {
    tape.plan(1);

    tape.strictEqual(
      getLocals({type: Person}, {className: 'myClassName'}).className,
      'myClassName',
      'should handle className option');

  });

  tape.test('disabled', function (tape) {
    tape.plan(3);

    tape.strictEqual(
      getLocals({type: Person}).disabled,
      undefined,
      'default disabled should be undefined');

    tape.strictEqual(
      getLocals({type: Person}, {disabled: true}).disabled,
      true,
      'should handle disabled = true');

    tape.strictEqual(
      getLocals({type: Person}, {disabled: false}).disabled,
      false,
      'should handle disabled = false');
  });

  tape.test('order', function (tape) {
    tape.plan(2);

    tape.deepEqual(
      getLocals({type: Person}).order,
      ['name', 'rememberMe', 'country', 'gender'],
      'shound use Object.keys as a default');

    tape.deepEqual(
      getLocals({type: Person}, {order: ['name']}).order,
      ['name'],
      'should handle order options');

  });

  tape.test('legend', function (tape) {
    tape.plan(2);

    tape.strictEqual(
      getLocals({type: Person}, {legend: 'mylegend'}).legend,
      'mylegend',
      'should handle legend as strings');

    tape.deepEqual(
      vdom(getLocals({type: Person}, {legend: React.DOM.i(null, 'JSX legend')}).legend),
      {tag: 'i', attrs: {}, children: 'JSX legend'},
      'should handle legend as JSX');
  });

  tape.test('help', function (tape) {
    tape.plan(2);

    tape.strictEqual(
      getLocals({type: Person}, {help: 'mylabel'}).help,
      'mylabel',
      'should handle help as strings');

    tape.deepEqual(
      vdom(getLocals({type: Person}, {help: React.DOM.i(null, 'JSX label')}).help),
      {tag: 'i', attrs: {}, children: 'JSX label'},
      'should handle help as JSX');
  });

  tape.test('hasError', function (tape) {
    tape.plan(2);

    tape.strictEqual(
      getLocals({type: Person}).hasError,
      false,
      'default hasError should be false');

    tape.strictEqual(
      getLocals({type: Person}, {hasError: true}).hasError,
      true,
      'should handle hasError option');
  });

  tape.test('error', function (tape) {
    tape.plan(4);

    tape.strictEqual(
      getLocals({type: Person}).error,
      undefined,
      'default error should be undefined');

    tape.strictEqual(
      getLocals({type: Person}, {error: 'myerror'}).error,
      'myerror',
      'should handle error option as string');

    tape.deepEqual(
      vdom(getLocals({type: Person}, {error: React.DOM.i(null, 'JSX label')}).error),
      {tag: 'i', attrs: {}, children: 'JSX label'},
      'should handle error option as JSX');

    tape.strictEqual(
      getLocals({type: Person}, {error: function (value) {
        return 'error: ' + JSON.stringify(value);
      }}, {}).error,
      'error: {}',
      'should handle error option as a function');
  });

  tape.test('value', function (tape) {
    tape.plan(2);

    tape.deepEqual(
      getLocals({type: Person}).value,
      {},
      'default value should be {}');

    tape.deepEqual(
      getLocals({type: Person}, null, {name: 'Giulio'}).value,
      {name: 'Giulio'},
      'should handle value prop');

  });

  if (typeof window !== 'undefined') {

    tape.test('getValue', function (tape) {
        tape.plan(2);

        getValue(function (result) {
          tape.strictEqual(result.isValid(), true);
          tape.deepEqual(result.value, {
            name: 'Giulio',
            rememberMe: true,
            country: 'IT',
            gender: 'M'
          });
        }, function () {
        }, {type: Person}, null, {
          name: 'Giulio',
          rememberMe: true,
          country: 'IT',
          gender: 'M'
        });

    });

  }

});


