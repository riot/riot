/* Riot v4.0.0-alpha.0, @license MIT */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.riot = {})));
}(this, (function (exports) { 'use strict';

  var assign = Object.assign;
  var create = Object.create;
  var toArray = Array.from;

  /**
   * Throw an error
   * @param {string} error - error message
   */
  function panic(error) {
    throw new Error(error)
  }

  var
    COMPONENTS_IMPLEMENTATION_MAP = new Map(),
    COMPONENTS_CREATION_MAP = new WeakMap(),
    MIXINS_MAP = new Map(),
    IS_DIRECTIVE = 'is';

  /**
   * Shorter and fast way to select multiple nodes in the DOM
   * @param   {string} selector - DOM selector
   * @param   {object} context - DOM node where the targets of our search will is located
   * @returns {array} dom nodes found
   */
  function $$(selector, context) {
    return toArray((context || document).querySelectorAll(selector))
  }

  /**
   * Get the value of any DOM attribute on a node
   * @param   {object} element - DOM node we want to inspect
   * @param   {string} name - name of the attribute we want to get
   * @returns {string|undefined} the node attribute if it exists
   */
  function getAttr(element, name) {
    return element.getAttribute(name)
  }

  /**
   * Get the tag name of any DOM node
   * @param   {object} element - DOM node we want to inspect
   * @returns {string} name to identify this dom node in riot
   */
  function getName(element) {
    return getAttr(element, IS_DIRECTIVE) || element.tagName.toLowerCase()
  }

  var COMPONENT_STRUCT = {
    update: function update() {

    },
    render: function render() {

    },
    mixin: function mixin() {

    },
    unmount: function unmount() {

    }
  };

  /**
   * Component definition factory function
   * @param   {object} implementation - component custom implementation
   * @returns {object} a new component implementation object
   */
  function define(implementation) {
    var component = assign({}, create(COMPONENT_STRUCT), implementation);
    return component
  }

  /**
   * Component initialization function
   * @param   {HTMLElement} element - element to upgrade
   * @param   {object} options - [description]
   * @returns {object} a new component instance bound to a DOM node
   */
  function initialize(element, options) {
    var name = getName(element);
    if (!COMPONENTS_IMPLEMENTATION_MAP.has(name)) { panic(("The component named \"" + name + "\" was never registered")); }
    var component = assign(
      create(COMPONENTS_IMPLEMENTATION_MAP.get(name)),
      {
        options: options
      }
    );
    COMPONENTS_CREATION_MAP.set(element, component);
    return component
  }

  /**
   * Quick type checking
   * @param   {*} element - anything
   * @param   {string} type - type definition
   * @returns {boolean}
   */
  function checkType(element, type) {
    return typeof element === type
  }
  /**
   * Check if passed argument is a function
   * @param   { * } value -
   * @returns { Boolean } -
   */
  function isFunction(value) {
    return checkType(value, 'function')
  }

  /**
   * Riot public api
   */

  /**
   * Register a custom tag by name
   * @param   {string} name - component name
   * @param   {object} implementation - tag implementation
   * @returns {object} object representing our tag implementation
   */
  function register(name, implementation) {
    if (COMPONENTS_IMPLEMENTATION_MAP.has(name)) { panic(("The component \"" + name + "\" was already registered")); }
    return COMPONENTS_IMPLEMENTATION_MAP.set(name, define(implementation))
  }

  /**
   * Unregister a riot web component
   * @param   {string} name - component name
   * @returns {boolean} true if deleted
   */
  function unregister(name) {
    if (COMPONENTS_IMPLEMENTATION_MAP.has(name)) { return COMPONENTS_IMPLEMENTATION_MAP.delete(name) }
    return false
  }

  /**
   * Mounting function
   * @param   {string|HTMLElement} selector - query for the selection or a DOM element
   * @param   {object} options - options that will be passed to the element instance
   * @returns {array} list of nodes upgraded
   */
  function mount(selector, options) {
    return $$(selector).map(function (element) { return initialize(element, options); })
  }

  /**
   * Unmounting function
   * @param   {string|HTMLElement} selector - query for the selection or a DOM element
   * @returns {array} list of nodes unmounted
   */
  function unmount(selector) {
    return $$(selector).map(function (element) {
      if (COMPONENTS_CREATION_MAP.has(element)) {
        COMPONENTS_CREATION_MAP.get(element).unmount();
      }
      return element
    })
  }

  /**
   * Define a mixin
   * @param   {string} name - mixin id
   * @param   {object|function} mixin - mixin logic
   * @returns {object} a copy of the mixin just created
   */
  function mixin(name, mixin) {
    if (MIXINS_MAP.has(name)) { panic(("The mixin \"" + name + "\" was already defined")); }
    var mix;

    if (isFunction(mixin)) {
      mix = create(mixin());
    } else {
      mix = create(mixin);
    }

    MIXINS_MAP.set(name, mix);

    return mix
  }

  exports.register = register;
  exports.unregister = unregister;
  exports.mount = mount;
  exports.unmount = unmount;
  exports.mixin = mixin;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
