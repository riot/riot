/* Riot v4.0.0-rc.5, @license MIT */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.riot = {}));
}(this, function (exports) { 'use strict';

  const COMPONENTS_IMPLEMENTATION_MAP = new Map(),
        DOM_COMPONENT_INSTANCE_PROPERTY = Symbol('riot-component'),
        PLUGINS_SET = new Set(),
        IS_DIRECTIVE = 'is',
        ATTRIBUTES_KEY_SYMBOL = Symbol('attributes'),
        TEMPLATE_KEY_SYMBOL = Symbol('template'),
        SLOTS_KEY_SYMBOL = Symbol('slots');

  var globals = /*#__PURE__*/Object.freeze({
    COMPONENTS_IMPLEMENTATION_MAP: COMPONENTS_IMPLEMENTATION_MAP,
    DOM_COMPONENT_INSTANCE_PROPERTY: DOM_COMPONENT_INSTANCE_PROPERTY,
    PLUGINS_SET: PLUGINS_SET,
    IS_DIRECTIVE: IS_DIRECTIVE,
    ATTRIBUTES_KEY_SYMBOL: ATTRIBUTES_KEY_SYMBOL,
    TEMPLATE_KEY_SYMBOL: TEMPLATE_KEY_SYMBOL,
    SLOTS_KEY_SYMBOL: SLOTS_KEY_SYMBOL
  });

  /**
   * Converts any DOM node/s to a loopable array
   * @param   { HTMLElement|NodeList } els - single html element or a node list
   * @returns { Array } always a loopable object
   */
  function domToArray(els) {
    // can this object be already looped?
    if (!Array.isArray(els)) {
      // is it a node list?
      if (/^\[object (HTMLCollection|NodeList|Object)\]$/.test(Object.prototype.toString.call(els)) && typeof els.length === 'number') return Array.from(els);else // if it's a single node
        // it will be returned as "array" with one single entry
        return [els];
    } // this object could be looped out of the box


    return els;
  }

  /**
   * Normalize the return values, in case of a single value we avoid to return an array
   * @param   { Array } values - list of values we want to return
   * @returns { Array|string|boolean } either the whole list of values or the single one found
   * @private
   */

  const normalize = values => values.length === 1 ? values[0] : values;
  /**
   * Parse all the nodes received to get/remove/check their attributes
   * @param   { HTMLElement|NodeList|Array } els    - DOM node/s to parse
   * @param   { string|Array }               name   - name or list of attributes
   * @param   { string }                     method - method that will be used to parse the attributes
   * @returns { Array|string } result of the parsing in a list or a single value
   * @private
   */


  function parseNodes(els, name, method) {
    const names = typeof name === 'string' ? [name] : name;
    return normalize(domToArray(els).map(el => {
      return normalize(names.map(n => el[method](n)));
    }));
  }
  /**
   * Set any attribute on a single or a list of DOM nodes
   * @param   { HTMLElement|NodeList|Array } els   - DOM node/s to parse
   * @param   { string|Object }              name  - either the name of the attribute to set
   *                                                 or a list of properties as object key - value
   * @param   { string }                     value - the new value of the attribute (optional)
   * @returns { HTMLElement|NodeList|Array } the original array of elements passed to this function
   *
   * @example
   *
   * import { set } from 'bianco.attr'
   *
   * const img = document.createElement('img')
   *
   * set(img, 'width', 100)
   *
   * // or also
   * set(img, {
   *   width: 300,
   *   height: 300
   * })
   *
   */


  function set(els, name, value) {
    const attrs = typeof name === 'object' ? name : {
      [name]: value
    };
    const props = Object.keys(attrs);
    domToArray(els).forEach(el => {
      props.forEach(prop => el.setAttribute(prop, attrs[prop]));
    });
    return els;
  }
  /**
   * Get any attribute from a single or a list of DOM nodes
   * @param   { HTMLElement|NodeList|Array } els   - DOM node/s to parse
   * @param   { string|Array }               name  - name or list of attributes to get
   * @returns { Array|string } list of the attributes found
   *
   * @example
   *
   * import { get } from 'bianco.attr'
   *
   * const img = document.createElement('img')
   *
   * get(img, 'width') // => '200'
   *
   * // or also
   * get(img, ['width', 'height']) // => ['200', '300']
   *
   * // or also
   * get([img1, img2], ['width', 'height']) // => [['200', '300'], ['500', '200']]
   */

  function get(els, name) {
    return parseNodes(els, name, 'getAttribute');
  }

  /**
   * Quick type checking
   * @param   {*} element - anything
   * @param   {string} type - type definition
   * @returns {boolean} true if the type corresponds
   */
  function checkType(element, type) {
    return typeof element === type;
  }
  /**
   * Check that will be passed if its argument is a function
   * @param   {*} value - value to check
   * @returns {boolean} - true if the value is a function
   */

  function isFunction(value) {
    return checkType(value, 'function');
  }

  /* eslint-disable fp/no-mutating-methods */
  /**
   * Throw an error
   * @param {string} error - error message
   * @returns {undefined} it's a IO void function
   */

  function panic(error) {
    throw new Error(error);
  }
  /**
   * Call the first argument received only if it's a function otherwise return it as it is
   * @param   {*} source - anything
   * @returns {*} anything
   */

  function callOrAssign(source) {
    return isFunction(source) ? source.prototype && source.prototype.constructor ? new source() : source() : source;
  }
  /**
   * Convert a string from camel case to dash-case
   * @param   {string} string - probably a component tag name
   * @returns {string} component name normalized
   */

  function camelToDashCase(string) {
    return string.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }
  /**
   * Convert a string containing dashes to camel case
   * @param   {string} string - input string
   * @returns {string} my-string -> myString
   */

  function dashToCamelCase(string) {
    return string.replace(/-(\w)/g, (_, c) => c.toUpperCase());
  }
  /**
   * Define default properties if they don't exist on the source object
   * @param   {Object} source - object that will receive the default properties
   * @param   {Object} defaults - object containing additional optional keys
   * @returns {Object} the original object received enhanced
   */

  function defineDefaults(source, defaults) {
    Object.entries(defaults).forEach((_ref) => {
      let key = _ref[0],
          value = _ref[1];
      if (!source[key]) source[key] = value;
    });
    return source;
  } // doese simply nothing

  function noop() {
    return this;
  }
  /**
   * Autobind the methods of a source object to itself
   * @param   {Object} source - probably a riot tag instance
   * @param   {Array<string>} methods - list of the methods to autobind
   * @returns {Object} the original object received
   */

  function autobindMethods(source, methods) {
    methods.forEach(method => {
      source[method] = source[method].bind(source);
    });
    return source;
  }
  /**
   * Helper function to set an immutable property
   * @param   {Object} source - object where the new property will be set
   * @param   {string} key - object key where the new property will be stored
   * @param   {*} value - value of the new property
   * @param   {Object} options - set the propery overriding the default options
   * @returns {Object} - the original object modified
   */

  function defineProperty(source, key, value, options) {
    if (options === void 0) {
      options = {};
    }

    Object.defineProperty(source, key, Object.assign({
      value,
      enumerable: false,
      writable: false,
      configurable: true
    }, options));
    return source;
  }
  /**
   * Normalize a DOM attribute that will be passed to a child component
   * @param   {string} attribute.name - attribute names might be dash case
   * @param   {*} attribute.value - sky is the limit
   * @returns {attribute} attribute object normalized
   */

  function normalizeAttribute(_ref2) {
    let name = _ref2.name,
        value = _ref2.value;
    return {
      name: dashToCamelCase(name),
      value: value
    };
  }
  /**
   * Define multiple properties on a target object
   * @param   {Object} source - object where the new properties will be set
   * @param   {Object} properties - object containing as key pair the key + value properties
   * @param   {Object} options - set the propery overriding the default options
   * @returns {Object} the original object modified
   */

  function defineProperties(source, properties, options) {
    Object.entries(properties).forEach((_ref3) => {
      let key = _ref3[0],
          value = _ref3[1];
      defineProperty(source, key, value, options);
    });
    return source;
  }
  /**
   * Evaluate a list of attribute expressions
   * @param   {Array} attributes - attribute expressions generated by the riot compiler
   * @param   {Object} scope - current scope
   * @returns {Object} key value pairs with the result of the computation
   */

  function evaluateAttributeExpressions(attributes, scope) {
    return attributes.reduce((acc, attribute) => {
      const attr = normalizeAttribute({
        value: attribute.evaluate(scope),
        name: attribute.name
      });
      acc[dashToCamelCase(attr.name)] = attr.value;
      return acc;
    }, {});
  }

  /**
   * Get all the element attributes as object
   * @param   {HTMLElement} element - DOM node we want to parse
   * @returns {Object} all the attributes found as a key value pairs
   */

  function DOMattributesToObject(element) {
    return Array.from(element.attributes).reduce((acc, attribute) => {
      const attr = normalizeAttribute(attribute);
      acc[attr.name] = attr.value;
      return acc;
    }, {});
  }
  /**
   * Get the tag name of any DOM node
   * @param   {HTMLElement} element - DOM node we want to inspect
   * @returns {string} name to identify this dom node in riot
   */

  function getName(element) {
    return get(element, IS_DIRECTIVE) || element.tagName.toLowerCase();
  }

  /**
   * Remove the child nodes from any DOM node
   * @param   {HTMLElement} node - target node
   * @returns {undefined}
   */
  function cleanNode(node) {
    const children = node.childNodes;
    Array.from(children).forEach(n => node.removeChild(n));
  }

  const EACH = 0;
  const IF = 1;
  const SIMPLE = 2;
  const TAG = 3;
  var bindingTypes = {
    EACH,
    IF,
    SIMPLE,
    TAG
  };
  /* get rid of the @ungap/essential-map polyfill */

  const append = (get, parent, children, start, end, before) => {
    if (end - start < 2) parent.insertBefore(get(children[start], 1), before);else {
      const fragment = parent.ownerDocument.createDocumentFragment();

      while (start < end) fragment.appendChild(get(children[start++], 1));

      parent.insertBefore(fragment, before);
    }
  };

  const eqeq = (a, b) => a == b;

  const identity = O => O;

  const indexOf = (moreNodes, moreStart, moreEnd, lessNodes, lessStart, lessEnd, compare) => {
    const length = lessEnd - lessStart;
    /* istanbul ignore if */

    if (length < 1) return -1;

    while (moreEnd - moreStart >= length) {
      let m = moreStart;
      let l = lessStart;

      while (m < moreEnd && l < lessEnd && compare(moreNodes[m], lessNodes[l])) {
        m++;
        l++;
      }

      if (l === lessEnd) return moreStart;
      moreStart = m + 1;
    }

    return -1;
  };

  const isReversed = (futureNodes, futureEnd, currentNodes, currentStart, currentEnd, compare) => {
    while (currentStart < currentEnd && compare(currentNodes[currentStart], futureNodes[futureEnd - 1])) {
      currentStart++;
      futureEnd--;
    }

    return futureEnd === 0;
  };

  const next = (get, list, i, length, before) => i < length ? get(list[i], 0) : 0 < i ? get(list[i - 1], -0).nextSibling : before;

  const remove = (get, parent, children, start, end) => {
    if (end - start < 2) parent.removeChild(get(children[start], -1));else {
      const range = parent.ownerDocument.createRange();
      range.setStartBefore(get(children[start], -1));
      range.setEndAfter(get(children[end - 1], -1));
      range.deleteContents();
    }
  }; // - - - - - - - - - - - - - - - - - - -
  // diff related constants and utilities
  // - - - - - - - - - - - - - - - - - - -


  const DELETION = -1;
  const INSERTION = 1;
  const SKIP = 0;
  const SKIP_OND = 50;

  const HS = (futureNodes, futureStart, futureEnd, futureChanges, currentNodes, currentStart, currentEnd, currentChanges) => {
    let k = 0;
    /* istanbul ignore next */

    let minLen = futureChanges < currentChanges ? futureChanges : currentChanges;
    const link = Array(minLen++);
    const tresh = Array(minLen);
    tresh[0] = -1;

    for (let i = 1; i < minLen; i++) tresh[i] = currentEnd;

    const keymap = new Map();

    for (let i = currentStart; i < currentEnd; i++) keymap.set(currentNodes[i], i);

    for (let i = futureStart; i < futureEnd; i++) {
      const idxInOld = keymap.get(futureNodes[i]);

      if (idxInOld != null) {
        k = findK(tresh, minLen, idxInOld);
        /* istanbul ignore else */

        if (-1 < k) {
          tresh[k] = idxInOld;
          link[k] = {
            newi: i,
            oldi: idxInOld,
            prev: link[k - 1]
          };
        }
      }
    }

    k = --minLen;
    --currentEnd;

    while (tresh[k] > currentEnd) --k;

    minLen = currentChanges + futureChanges - k;
    const diff = Array(minLen);
    let ptr = link[k];
    --futureEnd;

    while (ptr) {
      const _ptr = ptr,
            newi = _ptr.newi,
            oldi = _ptr.oldi;

      while (futureEnd > newi) {
        diff[--minLen] = INSERTION;
        --futureEnd;
      }

      while (currentEnd > oldi) {
        diff[--minLen] = DELETION;
        --currentEnd;
      }

      diff[--minLen] = SKIP;
      --futureEnd;
      --currentEnd;
      ptr = ptr.prev;
    }

    while (futureEnd >= futureStart) {
      diff[--minLen] = INSERTION;
      --futureEnd;
    }

    while (currentEnd >= currentStart) {
      diff[--minLen] = DELETION;
      --currentEnd;
    }

    return diff;
  }; // this is pretty much the same petit-dom code without the delete map part
  // https://github.com/yelouafi/petit-dom/blob/bd6f5c919b5ae5297be01612c524c40be45f14a7/src/vdom.js#L556-L561


  const OND = (futureNodes, futureStart, rows, currentNodes, currentStart, cols, compare) => {
    const length = rows + cols;
    const v = [];
    let d, k, r, c, pv, cv, pd;

    outer: for (d = 0; d <= length; d++) {
      /* istanbul ignore if */
      if (d > SKIP_OND) return null;
      pd = d - 1;
      /* istanbul ignore next */

      pv = d ? v[d - 1] : [0, 0];
      cv = v[d] = [];

      for (k = -d; k <= d; k += 2) {
        if (k === -d || k !== d && pv[pd + k - 1] < pv[pd + k + 1]) {
          c = pv[pd + k + 1];
        } else {
          c = pv[pd + k - 1] + 1;
        }

        r = c - k;

        while (c < cols && r < rows && compare(currentNodes[currentStart + c], futureNodes[futureStart + r])) {
          c++;
          r++;
        }

        if (c === cols && r === rows) {
          break outer;
        }

        cv[d + k] = c;
      }
    }

    const diff = Array(d / 2 + length / 2);
    let diffIdx = diff.length - 1;

    for (d = v.length - 1; d >= 0; d--) {
      while (c > 0 && r > 0 && compare(currentNodes[currentStart + c - 1], futureNodes[futureStart + r - 1])) {
        // diagonal edge = equality
        diff[diffIdx--] = SKIP;
        c--;
        r--;
      }

      if (!d) break;
      pd = d - 1;
      /* istanbul ignore next */

      pv = d ? v[d - 1] : [0, 0];
      k = c - r;

      if (k === -d || k !== d && pv[pd + k - 1] < pv[pd + k + 1]) {
        // vertical edge = insertion
        r--;
        diff[diffIdx--] = INSERTION;
      } else {
        // horizontal edge = deletion
        c--;
        diff[diffIdx--] = DELETION;
      }
    }

    return diff;
  };

  const applyDiff = (diff, get, parentNode, futureNodes, futureStart, currentNodes, currentStart, currentLength, before) => {
    const live = new Map();
    const length = diff.length;
    let currentIndex = currentStart;
    let i = 0;

    while (i < length) {
      switch (diff[i++]) {
        case SKIP:
          futureStart++;
          currentIndex++;
          break;

        case INSERTION:
          // TODO: bulk appends for sequential nodes
          live.set(futureNodes[futureStart], 1);
          append(get, parentNode, futureNodes, futureStart++, futureStart, currentIndex < currentLength ? get(currentNodes[currentIndex], 0) : before);
          break;

        case DELETION:
          currentIndex++;
          break;
      }
    }

    i = 0;

    while (i < length) {
      switch (diff[i++]) {
        case SKIP:
          currentStart++;
          break;

        case DELETION:
          // TODO: bulk removes for sequential nodes
          if (live.has(currentNodes[currentStart])) currentStart++;else remove(get, parentNode, currentNodes, currentStart++, currentStart);
          break;
      }
    }
  };

  const findK = (ktr, length, j) => {
    let lo = 1;
    let hi = length;

    while (lo < hi) {
      const mid = (lo + hi) / 2 >>> 0;
      if (j < ktr[mid]) hi = mid;else lo = mid + 1;
    }

    return lo;
  };

  const smartDiff = (get, parentNode, futureNodes, futureStart, futureEnd, futureChanges, currentNodes, currentStart, currentEnd, currentChanges, currentLength, compare, before) => {
    applyDiff(OND(futureNodes, futureStart, futureChanges, currentNodes, currentStart, currentChanges, compare) || HS(futureNodes, futureStart, futureEnd, futureChanges, currentNodes, currentStart, currentEnd, currentChanges), get, parentNode, futureNodes, futureStart, currentNodes, currentStart, currentLength, before);
  };
  /*! (c) 2018 Andrea Giammarchi (ISC) */


  const domdiff = (parentNode, // where changes happen
  currentNodes, // Array of current items/nodes
  futureNodes, // Array of future items/nodes
  options // optional object with one of the following properties
  //  before: domNode
  //  compare(generic, generic) => true if same generic
  //  node(generic) => Node
  ) => {
    if (!options) options = {};
    const compare = options.compare || eqeq;
    const get = options.node || identity;
    const before = options.before == null ? null : get(options.before, 0);
    const currentLength = currentNodes.length;
    let currentEnd = currentLength;
    let currentStart = 0;
    let futureEnd = futureNodes.length;
    let futureStart = 0; // common prefix

    while (currentStart < currentEnd && futureStart < futureEnd && compare(currentNodes[currentStart], futureNodes[futureStart])) {
      currentStart++;
      futureStart++;
    } // common suffix


    while (currentStart < currentEnd && futureStart < futureEnd && compare(currentNodes[currentEnd - 1], futureNodes[futureEnd - 1])) {
      currentEnd--;
      futureEnd--;
    }

    const currentSame = currentStart === currentEnd;
    const futureSame = futureStart === futureEnd; // same list

    if (currentSame && futureSame) return futureNodes; // only stuff to add

    if (currentSame && futureStart < futureEnd) {
      append(get, parentNode, futureNodes, futureStart, futureEnd, next(get, currentNodes, currentStart, currentLength, before));
      return futureNodes;
    } // only stuff to remove


    if (futureSame && currentStart < currentEnd) {
      remove(get, parentNode, currentNodes, currentStart, currentEnd);
      return futureNodes;
    }

    const currentChanges = currentEnd - currentStart;
    const futureChanges = futureEnd - futureStart;
    let i = -1; // 2 simple indels: the shortest sequence is a subsequence of the longest

    if (currentChanges < futureChanges) {
      i = indexOf(futureNodes, futureStart, futureEnd, currentNodes, currentStart, currentEnd, compare); // inner diff

      if (-1 < i) {
        append(get, parentNode, futureNodes, futureStart, i, get(currentNodes[currentStart], 0));
        append(get, parentNode, futureNodes, i + currentChanges, futureEnd, next(get, currentNodes, currentEnd, currentLength, before));
        return futureNodes;
      }
    }
    /* istanbul ignore else */
    else if (futureChanges < currentChanges) {
        i = indexOf(currentNodes, currentStart, currentEnd, futureNodes, futureStart, futureEnd, compare); // outer diff

        if (-1 < i) {
          remove(get, parentNode, currentNodes, currentStart, i);
          remove(get, parentNode, currentNodes, i + futureChanges, currentEnd);
          return futureNodes;
        }
      } // common case with one replacement for many nodes
    // or many nodes replaced for a single one

    /* istanbul ignore else */


    if (currentChanges < 2 || futureChanges < 2) {
      append(get, parentNode, futureNodes, futureStart, futureEnd, get(currentNodes[currentStart], 0));
      remove(get, parentNode, currentNodes, currentStart, currentEnd);
      return futureNodes;
    } // the half match diff part has been skipped in petit-dom
    // https://github.com/yelouafi/petit-dom/blob/bd6f5c919b5ae5297be01612c524c40be45f14a7/src/vdom.js#L391-L397
    // accordingly, I think it's safe to skip in here too
    // if one day it'll come out like the speediest thing ever to do
    // then I might add it in here too
    // Extra: before going too fancy, what about reversed lists ?
    //        This should bail out pretty quickly if that's not the case.


    if (currentChanges === futureChanges && isReversed(futureNodes, futureEnd, currentNodes, currentStart, currentEnd, compare)) {
      append(get, parentNode, futureNodes, futureStart, futureEnd, next(get, currentNodes, currentEnd, currentLength, before));
      return futureNodes;
    } // last resort through a smart diff


    smartDiff(get, parentNode, futureNodes, futureStart, futureEnd, futureChanges, currentNodes, currentStart, currentEnd, currentChanges, currentLength, compare, before);
    return futureNodes;
  };

  const EachBinding = Object.seal({
    // dynamic binding properties
    childrenMap: null,
    node: null,
    root: null,
    condition: null,
    evaluate: null,
    template: null,
    tags: [],
    getKey: null,
    indexName: null,
    itemName: null,
    afterPlaceholder: null,
    placeholder: null,

    // API methods
    mount(scope) {
      return this.update(scope);
    },

    update(scope) {
      const placeholder = this.placeholder;
      const collection = this.evaluate(scope);
      const items = collection ? Array.from(collection) : [];
      const parent = placeholder.parentNode; // prepare the diffing

      const _loopItems = loopItems(items, scope, this),
            newChildrenMap = _loopItems.newChildrenMap,
            batches = _loopItems.batches,
            futureNodes = _loopItems.futureNodes;
      /**
       * DOM Updates
       */


      const before = this.tags[this.tags.length - 1];
      domdiff(parent, this.tags, futureNodes, {
        before: before ? before.nextSibling : placeholder.nextSibling
      }); // trigger the mounts and the updates

      batches.forEach(fn => fn()); // update the children map

      this.childrenMap = newChildrenMap;
      this.tags = futureNodes;
      return this;
    },

    unmount() {
      Array.from(this.childrenMap.values()).forEach((_ref) => {
        let tag = _ref.tag,
            context = _ref.context;
        tag.unmount(context, true);
      });
      this.childrenMap = new Map();
      this.tags = [];
      return this;
    }

  });
  /**
   * Check whether a tag must be filtered from a loop
   * @param   {Function} condition - filter function
   * @param   {Object} context - argument passed to the filter function
   * @returns {boolean} true if this item should be skipped
   */

  function mustFilterItem(condition, context) {
    return condition ? Boolean(condition(context)) === false : false;
  }
  /**
   * Get the context of the looped tag
   * @param   {string} options.itemName - key to identify the looped item in the new context
   * @param   {string} options.indexName - key to identify the index of the looped item
   * @param   {number} options.index - current index
   * @param   {*} options.item - collection item looped
   * @param   {*} options.scope - current parent scope
   * @returns {Object} enhanced scope object
   */


  function getContext(_ref2) {
    let itemName = _ref2.itemName,
        indexName = _ref2.indexName,
        index = _ref2.index,
        item = _ref2.item,
        scope = _ref2.scope;
    const context = Object.assign({
      [itemName]: item
    }, scope);

    if (indexName) {
      return Object.assign({
        [indexName]: index
      }, context);
    }

    return context;
  }
  /**
   * Loop the current tag items
   * @param   { Array } items - tag collection
   * @param   { * } scope - tag scope
   * @param   { EeachBinding } binding - each binding object instance
   * @returns { Object } data
   * @returns { Map } data.newChildrenMap - a Map containing the new children tags structure
   * @returns { Array } data.batches - array containing functions the tags lifecycle functions to trigger
   * @returns { Array } data.futureNodes - array containing the nodes we need to diff
   */


  function loopItems(items, scope, binding) {
    const condition = binding.condition,
          template = binding.template,
          childrenMap = binding.childrenMap,
          itemName = binding.itemName,
          getKey = binding.getKey,
          indexName = binding.indexName,
          root = binding.root;
    const filteredItems = new Set();
    const newChildrenMap = new Map();
    const batches = [];
    const futureNodes = [];
    items.forEach((item, i) => {
      // the real item index should be subtracted to the items that were filtered
      const index = i - filteredItems.size;
      const context = getContext({
        itemName,
        indexName,
        index,
        item,
        scope
      });
      const key = getKey ? getKey(context) : index;
      const oldItem = childrenMap.get(key);

      if (mustFilterItem(condition, context)) {
        filteredItems.add(oldItem);
        return;
      }

      const tag = oldItem ? oldItem.tag : template.clone();
      const el = oldItem ? tag.el : root.cloneNode();

      if (!oldItem) {
        batches.push(() => tag.mount(el, context));
      } else {
        batches.push(() => tag.update(context));
      }

      futureNodes.push(el); // update the children map

      newChildrenMap.set(key, {
        tag,
        context,
        index
      });
    });
    return {
      newChildrenMap,
      batches,
      futureNodes
    };
  }

  function create(node, _ref3) {
    let evaluate = _ref3.evaluate,
        condition = _ref3.condition,
        itemName = _ref3.itemName,
        indexName = _ref3.indexName,
        getKey = _ref3.getKey,
        template = _ref3.template;
    const placeholder = document.createTextNode('');
    const parent = node.parentNode;
    const root = node.cloneNode();
    const offset = Array.from(parent.childNodes).indexOf(node);
    parent.insertBefore(placeholder, node);
    parent.removeChild(node);
    return Object.assign({}, EachBinding, {
      childrenMap: new Map(),
      node,
      root,
      offset,
      condition,
      evaluate,
      template: template.createDOM(node),
      getKey,
      indexName,
      itemName,
      placeholder
    });
  }
  /**
   * Binding responsible for the `if` directive
   */


  const IfBinding = Object.seal({
    // dynamic binding properties
    node: null,
    evaluate: null,
    placeholder: null,
    template: '',

    // API methods
    mount(scope) {
      swap(this.placeholder, this.node);
      return this.update(scope);
    },

    update(scope) {
      const value = !!this.evaluate(scope);
      const mustMount = !this.value && value;
      const mustUnmount = this.value && !value;

      switch (true) {
        case mustMount:
          swap(this.node, this.placeholder);

          if (this.template) {
            this.template = this.template.clone();
            this.template.mount(this.node, scope);
          }

          break;

        case mustUnmount:
          this.unmount(scope);
          swap(this.placeholder, this.node);
          break;

        default:
          if (value) this.template.update(scope);
      }

      this.value = value;
      return this;
    },

    unmount(scope) {
      const template = this.template;

      if (template) {
        template.unmount(scope);
      }

      return this;
    }

  });

  function swap(inNode, outNode) {
    const parent = outNode.parentNode;
    parent.insertBefore(inNode, outNode);
    parent.removeChild(outNode);
  }

  function create$1(node, _ref4) {
    let evaluate = _ref4.evaluate,
        template = _ref4.template;
    return Object.assign({}, IfBinding, {
      node,
      evaluate,
      placeholder: document.createTextNode(''),
      template: template.createDOM(node)
    });
  }

  const ATTRIBUTE = 0;
  const EVENT = 1;
  const TEXT = 2;
  const VALUE = 3;
  var expressionTypes = {
    ATTRIBUTE,
    EVENT,
    TEXT,
    VALUE
  };
  const REMOVE_ATTRIBUTE = 'removeAttribute';
  const SET_ATTIBUTE = 'setAttribute';
  /**
   * Add all the attributes provided
   * @param   {HTMLElement} node - target node
   * @param   {Object} attributes - object containing the attributes names and values
   * @returns {undefined} sorry it's a void function :(
   */

  function setAllAttributes(node, attributes) {
    Object.entries(attributes).forEach((_ref5) => {
      let name = _ref5[0],
          value = _ref5[1];
      return attributeExpression(node, {
        name
      }, value);
    });
  }
  /**
   * Remove all the attributes provided
   * @param   {HTMLElement} node - target node
   * @param   {Object} attributes - object containing all the attribute names
   * @returns {undefined} sorry it's a void function :(
   */


  function removeAllAttributes(node, attributes) {
    Object.keys(attributes).forEach(attribute => node.removeAttribute(attribute));
  }
  /**
   * This methods handles the DOM attributes updates
   * @param   {HTMLElement} node - target node
   * @param   {Object} expression - expression object
   * @param   {string} expression.name - attribute name
   * @param   {*} value - new expression value
   * @param   {*} oldValue - the old expression cached value
   * @returns {undefined}
   */


  function attributeExpression(node, _ref6, value, oldValue) {
    let name = _ref6.name;

    // is it a spread operator? {...attributes}
    if (!name) {
      // is the value still truthy?
      if (value) {
        setAllAttributes(node, value);
      } else if (oldValue) {
        // otherwise remove all the old attributes
        removeAllAttributes(node, oldValue);
      }

      return;
    } // handle boolean attributes


    if (typeof value === 'boolean') {
      node[name] = value;
    }

    node[getMethod(value)](name, normalizeValue(name, value));
  }
  /**
   * Get the attribute modifier method
   * @param   {*} value - if truthy we return `setAttribute` othewise `removeAttribute`
   * @returns {string} the node attribute modifier method name
   */


  function getMethod(value) {
    return value && typeof value !== 'object' ? SET_ATTIBUTE : REMOVE_ATTRIBUTE;
  }
  /**
   * Get the value as string
   * @param   {string} name - attribute name
   * @param   {*} value - user input value
   * @returns {string} input value as string
   */


  function normalizeValue(name, value) {
    // be sure that expressions like selected={ true } will be always rendered as selected='selected'
    if (value === true) return name;
    return value;
  }
  /**
   * Set a new event listener
   * @param   {HTMLElement} node - target node
   * @param   {Object} expression - expression object
   * @param   {string} expression.name - event name
   * @param   {*} value - new expression value
   * @returns {undefined}
   */


  function eventExpression(node, _ref7, value) {
    let name = _ref7.name;
    node[name] = value;
  }
  /**
   * This methods handles a simple text expression update
   * @param   {HTMLElement} node - target node
   * @param   {Object} expression - expression object
   * @param   {number} expression.childNodeIndex - index to find the text node to update
   * @param   {*} value - new expression value
   * @returns {undefined}
   */


  function textExpression(node, _ref8, value) {
    let childNodeIndex = _ref8.childNodeIndex;
    const target = node.childNodes[childNodeIndex];
    const val = normalizeValue$1(value); // replace the target if it's a placeholder comment

    if (target.nodeType === Node.COMMENT_NODE) {
      const textNode = document.createTextNode(val);
      node.replaceChild(textNode, target);
    } else {
      target.data = normalizeValue$1(val);
    }
  }
  /**
   * Normalize the user value in order to render a empty string in case of falsy values
   * @param   {*} value - user input value
   * @returns {string} hopefully a string
   */


  function normalizeValue$1(value) {
    return value != null ? value : '';
  }
  /**
   * This methods handles the input fileds value updates
   * @param   {HTMLElement} node - target node
   * @param   {Object} expression - expression object
   * @param   {*} value - new expression value
   * @returns {undefined}
   */


  function valueExpression(node, expression, value) {
    node.value = value;
  }

  var expressions = {
    [ATTRIBUTE]: attributeExpression,
    [EVENT]: eventExpression,
    [TEXT]: textExpression,
    [VALUE]: valueExpression
  };
  const Expression = Object.seal({
    // Static props
    node: null,
    value: null,

    // API methods

    /**
     * Mount the expression evaluating its initial value
     * @param   {*} scope - argument passed to the expression to evaluate its current values
     * @returns {Expression} self
     */
    mount(scope) {
      // hopefully a pure function
      this.value = this.evaluate(scope); // IO() DOM updates

      apply(this, this.value);
      return this;
    },

    /**
     * Update the expression if its value changed
     * @param   {*} scope - argument passed to the expression to evaluate its current values
     * @returns {Expression} self
     */
    update(scope) {
      // pure function
      const value = this.evaluate(scope);

      if (this.value !== value) {
        // IO() DOM updates
        apply(this, value);
        this.value = value;
      }

      return this;
    },

    /**
     * Expression teardown method
     * @returns {Expression} self
     */
    unmount() {
      return this;
    }

  });
  /**
   * IO() function to handle the DOM updates
   * @param {Expression} expression - expression object
   * @param {*} value - current expression value
   * @returns {undefined}
   */

  function apply(expression, value) {
    return expressions[expression.type](expression.node, expression, value, expression.value);
  }

  function create$2(node, data) {
    return Object.assign({}, Expression, data, {
      node
    });
  }
  /**
   * Create a flat object having as keys a list of methods that if dispatched will propagate
   * on the whole collection
   * @param   {Array} collection - collection to iterate
   * @param   {Array<string>} methods - methods to execute on each item of the collection
   * @param   {*} context - context returned by the new methods created
   * @returns {Object} a new object to simplify the the nested methods dispatching
   */


  function flattenCollectionMethods(collection, methods, context) {
    return methods.reduce((acc, method) => {
      return Object.assign({}, acc, {
        [method]: scope => {
          return collection.map(item => item[method](scope)) && context;
        }
      });
    }, {});
  }

  function create$3(node, _ref9) {
    let expressions = _ref9.expressions;
    return Object.assign({}, flattenCollectionMethods(expressions.map(expression => create$2(node, expression)), ['mount', 'update', 'unmount']));
  }
  /**
   * Create a new tag object if it was registered before, otherwise fallback to the simple
   * template chunk
   * @param   {Function} component - component factory function
   * @param   {Array<Object>} slots - array containing the slots markup
   * @param   {Array} attributes - dynamic attributes that will be received by the tag element
   * @returns {TagImplementation|TemplateChunk} a tag implementation or a template chunk as fallback
   */


  function getTag(component, slots, attributes) {
    if (slots === void 0) {
      slots = [];
    }

    if (attributes === void 0) {
      attributes = [];
    }

    // if this tag was registered before we will return its implementation
    if (component) {
      return component({
        slots,
        attributes
      });
    } // otherwise we return a template chunk


    return create$6(slotsToMarkup(slots), [...slotBindings(slots), {
      // the attributes should be registered as binding
      // if we fallback to a normal template chunk
      expressions: attributes.map(attr => {
        return Object.assign({
          type: ATTRIBUTE
        }, attr);
      })
    }]);
  }
  /**
   * Merge all the slots bindings into a single array
   * @param   {Array<Object>} slots - slots collection
   * @returns {Array<Bindings>} flatten bindings array
   */


  function slotBindings(slots) {
    return slots.reduce((acc, _ref10) => {
      let bindings = _ref10.bindings;
      return acc.concat(bindings);
    }, []);
  }
  /**
   * Merge all the slots together in a single markup string
   * @param   {Array<Object>} slots - slots collection
   * @returns {string} markup of all the slots in a single string
   */


  function slotsToMarkup(slots) {
    return slots.reduce((acc, slot) => {
      return acc + slot.html;
    }, '');
  }

  const TagBinding = Object.seal({
    // dynamic binding properties
    node: null,
    evaluate: null,
    name: null,
    slots: null,
    tag: null,
    attributes: null,
    getComponent: null,

    mount(scope) {
      return this.update(scope);
    },

    update(scope) {
      const name = this.evaluate(scope); // simple update

      if (name === this.name) {
        this.tag.update(scope);
      } else {
        // unmount the old tag if it exists
        this.unmount(); // mount the new tag

        this.name = name;
        this.tag = getTag(this.getComponent(name), this.slots, this.attributes);
        this.tag.mount(this.node, scope);
      }

      return this;
    },

    unmount() {
      if (this.tag) {
        // keep the root tag
        this.tag.unmount(true);
      }

      return this;
    }

  });

  function create$4(node, _ref11) {
    let evaluate = _ref11.evaluate,
        getComponent = _ref11.getComponent,
        slots = _ref11.slots,
        attributes = _ref11.attributes;
    return Object.assign({}, TagBinding, {
      node,
      evaluate,
      slots,
      attributes,
      getComponent
    });
  }

  var bindings = {
    [IF]: create$1,
    [SIMPLE]: create$3,
    [EACH]: create,
    [TAG]: create$4
  };
  /**
   * Bind a new expression object to a DOM node
   * @param   {HTMLElement} root - DOM node where to bind the expression
   * @param   {Object} binding - binding data
   * @returns {Expression} Expression object
   */

  function create$5(root, binding) {
    const selector = binding.selector,
          type = binding.type,
          redundantAttribute = binding.redundantAttribute,
          expressions = binding.expressions; // find the node to apply the bindings

    const node = selector ? root.querySelector(selector) : root; // remove eventually additional attributes created only to select this node

    if (redundantAttribute) node.removeAttribute(redundantAttribute); // init the binding

    return (bindings[type] || bindings[SIMPLE])(node, Object.assign({}, binding, {
      expressions: expressions || []
    }));
  }
  /**
   * Check if an element is part of an svg
   * @param   {HTMLElement}  el - element to check
   * @returns {boolean} true if we are in an svg context
   */


  function isSvg(el) {
    const owner = el.ownerSVGElement;
    return !!owner || owner === null;
  } // in this case a simple innerHTML is enough


  function createHTMLTree(html) {
    const template = document.createElement('template');
    template.innerHTML = html;
    return template.content;
  } // for svg nodes we need a bit more work


  function creteSVGTree(html, container) {
    // create the SVGNode
    const svgNode = container.ownerDocument.importNode(new window.DOMParser().parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${html}</svg>`, 'application/xml').documentElement, true);
    return svgNode;
  }
  /**
   * Create the DOM that will be injected
   * @param {Object} root - DOM node to find out the context where the fragment will be created
   * @param   {string} html - DOM to create as string
   * @returns {HTMLDocumentFragment|HTMLElement} a new html fragment
   */


  function createDOMTree(root, html) {
    if (isSvg(root)) return creteSVGTree(html, root);
    return createHTMLTree(html);
  }
  /**
   * Move all the child nodes from a source tag to another
   * @param   {HTMLElement} source - source node
   * @param   {HTMLElement} target - target node
   * @returns {undefined} it's a void method ¯\_(ツ)_/¯
   */
  // Ignore this helper because it's needed only for svg tags

  /* istanbul ignore next */


  function moveChildren(source, target) {
    if (source.firstChild) {
      target.appendChild(source.firstChild);
      moveChildren(source, target);
    }
  }

  const SVG_RE = /svg/i;
  /**
   * Inject the DOM tree into a target node
   * @param   {HTMLElement} el - target element
   * @param   {HTMLFragment|SVGElement} dom - dom tree to inject
   * @returns {undefined}
   */

  function injectDOM(el, dom) {
    if (SVG_RE.test(el.tagName)) {
      moveChildren(dom, el);
    } else {
      el.appendChild(dom);
    }
  }
  /**
   * Create the Template DOM skeleton
   * @param   {HTMLElement} el - root node where the DOM will be injected
   * @param   {string} html - markup that will be injected into the root node
   * @returns {HTMLFragment} fragment that will be injected into the root node
   */


  function createTemplateDOM(el, html) {
    return html && (typeof html === 'string' ? createDOMTree(el, html) : html);
  }
  /**
   * Template Chunk model
   * @type {Object}
   */


  const TemplateChunk = Object.freeze({
    // Static props
    bindings: null,
    bindingsData: null,
    html: null,
    dom: null,
    el: null,

    /**
     * Create the template DOM structure that will be cloned on each mount
     * @param   {HTMLElement} el - the root node
     * @returns {TemplateChunk} self
     */
    createDOM(el) {
      // make sure that the DOM gets created before cloning the template
      this.dom = this.dom || createTemplateDOM(el, this.html);
      return this;
    },

    // API methods

    /**
     * Attach the template to a DOM node
     * @param   {HTMLElement} el - target DOM node
     * @param   {*} scope - template data
     * @returns {TemplateChunk} self
     */
    mount(el, scope) {
      if (!el) throw new Error('Please provide DOM node to mount properly your template');
      if (this.el) this.unmount(scope);
      this.el = el; // create the DOM if it wasn't created before

      this.createDOM(el);
      if (this.dom) injectDOM(el, this.dom.cloneNode(true)); // create the bindings

      this.bindings = this.bindingsData.map(binding => create$5(this.el, binding));
      this.bindings.forEach(b => b.mount(scope));
      return this;
    },

    /**
     * Update the template with fresh data
     * @param   {*} scope - template data
     * @returns {TemplateChunk} self
     */
    update(scope) {
      this.bindings.forEach(b => b.update(scope));
      return this;
    },

    /**
     * Remove the template from the node where it was initially mounted
     * @param   {*} scope - template data
     * @param   {boolean} mustRemoveRoot - if true remove the root element
     * @returns {TemplateChunk} self
     */
    unmount(scope, mustRemoveRoot) {
      if (this.el) {
        this.bindings.forEach(b => b.unmount(scope));
        cleanNode(this.el);

        if (mustRemoveRoot && this.el.parentNode) {
          this.el.parentNode.removeChild(this.el);
        }

        this.el = null;
      }

      return this;
    },

    /**
     * Clone the template chunk
     * @returns {TemplateChunk} a clone of this object resetting the this.el property
     */
    clone() {
      return Object.assign({}, this, {
        el: null
      });
    }

  });
  /**
   * Create a template chunk wiring also the bindings
   * @param   {string|HTMLElement} html - template string
   * @param   {Array} bindings - bindings collection
   * @returns {TemplateChunk} a new TemplateChunk copy
   */

  function create$6(html, bindings) {
    if (bindings === void 0) {
      bindings = [];
    }

    return Object.assign({}, TemplateChunk, {
      html,
      bindingsData: bindings
    });
  }

  /**
   * Simple helper to find DOM nodes returning them as array like loopable object
   * @param   { string|DOMNodeList } selector - either the query or the DOM nodes to arraify
   * @param   { HTMLElement }        ctx      - context defining where the query will search for the DOM nodes
   * @returns { Array } DOM nodes found as array
   */

  function $(selector, ctx) {
    return domToArray(typeof selector === 'string' ? (ctx || document).querySelectorAll(selector) : selector);
  }

  /**
   * Binding responsible for the slots
   */

  const Slot = Object.seal({
    // dynamic binding properties
    node: null,
    name: null,
    template: null,

    // API methods
    mount(scope) {
      if (this.template) {
        this.template.mount(this.node, scope);
        moveSlotInnerContent(this.node);
      } else {
        this.node.parentNode.removeChild(this.node);
      }

      return this;
    },

    update(scope) {
      if (this.template) {
        this.template.update(scope);
      }

      return this;
    },

    unmount(scope) {
      if (this.template) {
        this.template.unmount(scope);
      }

      return this;
    }

  });
  /**
   * Move the inner content of the slots outside of them
   * @param   {HTMLNode} slot - slot node
   * @returns {undefined} it's a void function
   */

  function moveSlotInnerContent(slot) {
    if (slot.firstChild) {
      slot.parentNode.insertBefore(slot.firstChild, slot);
      moveSlotInnerContent(slot);
    }

    if (slot.parentNode) {
      slot.parentNode.removeChild(slot);
    }
  }
  /**
   * Create a single slot binding
   * @param   {HTMLElement} root - component root
   * @param   {HTMLElement} node - slot node
   * @param   {string} options.name - slot id
   * @param   {Array} options.slots - component slots
   * @returns {Object} Slot binding object
   */


  function createSlot(root, node, _ref) {
    let name = _ref.name,
        slots = _ref.slots;
    const templateData = slots.find((_ref2) => {
      let id = _ref2.id;
      return id === name;
    });
    return Object.assign({}, Slot, {
      node,
      name,
      template: templateData && create$6(templateData.html, templateData.bindings).createDOM(root)
    });
  }
  /**
   * Create the object that will manage the slots
   * @param   {HTMLElement} root - component root element
   * @param   {Array} slots - slots objects containing html and bindings
   * @return  {Object} tag like interface that will manage all the slots
   */


  function createSlots(root, slots) {
    const slotNodes = $('slot', root);
    const slotsBindings = slotNodes.map(node => {
      const name = get(node, 'name') || 'default';
      return createSlot(root, node, {
        name,
        slots
      });
    });
    return {
      mount(scope) {
        slotsBindings.forEach(s => s.mount(scope));
        return this;
      },

      update(scope) {
        slotsBindings.forEach(s => s.update(scope));
        return this;
      },

      unmount(scope) {
        slotsBindings.forEach(s => s.unmount(scope));
        return this;
      }

    };
  }

  const CSS_BY_NAME = new Map();
  const STYLE_NODE_SELECTOR = 'style[riot]'; // memoized curried function

  const getStyleNode = (style => {
    return () => {
      // lazy evaluation:
      // if this function was already called before
      // we return its cached result
      if (style) return style; // create a new style element or use an existing one
      // and cache it internally

      style = $(STYLE_NODE_SELECTOR)[0] || document.createElement('style');
      set(style, 'type', 'text/css');
      /* istanbul ignore next */

      if (!style.parentNode) document.head.appendChild(style);
      return style;
    };
  })();
  /**
   * Object that will be used to inject and manage the css of every tag instance
   */


  var cssManager = {
    CSS_BY_NAME,

    /**
     * Save a tag style to be later injected into DOM
     * @param { string } name - if it's passed we will map the css to a tagname
     * @param { string } css - css string
     * @returns {Object} self
     */
    add(name, css) {
      if (!CSS_BY_NAME.has(name)) {
        CSS_BY_NAME.set(name, css);
      }

      this.inject();
      return this;
    },

    /**
     * Inject all previously saved tag styles into DOM
     * innerHTML seems slow: http://jsperf.com/riot-insert-style
     * @returns {Object} self
     */
    inject() {
      getStyleNode().innerHTML = [...CSS_BY_NAME.values()].join('\n');
      return this;
    },

    /**
     * Remove a tag style from the DOM
     * @param {string} name a registered tagname
     * @returns {Object} self
     */
    remove(name) {
      if (CSS_BY_NAME.has(name)) {
        CSS_BY_NAME.delete(name);
        this.inject();
      }

      return this;
    }

  };

  /**
   * Function to curry any javascript method
   * @param   {Function}  fn - the target function we want to curry
   * @param   {...[args]} acc - initial arguments
   * @returns {Function|*} it will return a function until the target function
   *                       will receive all of its arguments
   */
  function curry(fn) {
    for (var _len = arguments.length, acc = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      acc[_key - 1] = arguments[_key];
    }

    return function () {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      args = [...acc, ...args];
      return args.length < fn.length ? curry(fn, ...args) : fn(...args);
    };
  }

  const COMPONENT_CORE_HELPERS = Object.freeze({
    // component helpers
    $(selector) {
      return $(selector, this.root)[0];
    },

    $$(selector) {
      return $(selector, this.root);
    }

  });
  const COMPONENT_LIFECYCLE_METHODS = Object.freeze({
    shouldUpdate: noop,
    onBeforeMount: noop,
    onMounted: noop,
    onBeforeUpdate: noop,
    onUpdated: noop,
    onBeforeUnmount: noop,
    onUnmounted: noop
  });
  const MOCKED_TEMPLATE_INTERFACE = {
    update: noop,
    mount: noop,
    unmount: noop,
    clone: noop,
    createDOM: noop
    /**
     * Create the component interface needed for the @riotjs/dom-bindings tag bindings
     * @param   {string} options.css - component css
     * @param   {Function} options.template - functon that will return the dom-bindings template function
     * @param   {Object} options.exports - component interface
     * @param   {string} options.name - component name
     * @returns {Object} component like interface
     */

  };
  function createComponent(_ref) {
    let css = _ref.css,
        template = _ref.template,
        exports = _ref.exports,
        name = _ref.name;
    return (_ref2) => {
      let slots = _ref2.slots,
          attributes = _ref2.attributes,
          props = _ref2.props;
      const component = defineComponent({
        css,
        template,
        exports,
        name
      })({
        slots,
        attributes,
        props
      }); // notice that for the components create via tag binding
      // we need to invert the mount (state/parentScope) arguments
      // the template bindings will only forward the parentScope updates
      // and never deal with the component state

      return {
        mount(element, parentScope, state) {
          return component.mount(element, state, parentScope);
        },

        update(parentScope, state) {
          return component.update(state, parentScope);
        },

        unmount(preserveRoot) {
          return component.unmount(preserveRoot);
        }

      };
    };
  }
  /**
   * Component definition function
   * @param   {Object} implementation - the componen implementation will be generated via compiler
   * @param   {Object} component - the component initial properties
   * @returns {Object} a new component implementation object
   */

  function defineComponent(_ref3) {
    let css = _ref3.css,
        template = _ref3.template,
        exports = _ref3.exports,
        name = _ref3.name;
    const componentAPI = callOrAssign(exports) || {};
    const components = createSubcomponents(componentAPI.components); // add the component css into the DOM

    if (css && name) cssManager.add(name, css);
    return curry(enhanceComponentAPI)(defineProperties( // set the component defaults without overriding the original component API
    defineDefaults(componentAPI, Object.assign({}, COMPONENT_LIFECYCLE_METHODS, {
      state: {}
    })), Object.assign({
      // defined during the component creation
      slots: null,
      root: null
    }, COMPONENT_CORE_HELPERS, {
      name,
      css,
      template: template ? template(create$6, expressionTypes, bindingTypes, name => {
        return components[name] || COMPONENTS_IMPLEMENTATION_MAP.get(name);
      }) : MOCKED_TEMPLATE_INTERFACE
    })));
  }
  /**
   * Evaluate the component properties either from its real attributes or from its attribute expressions
   * @param   {HTMLElement} element - component root
   * @param   {Array}  attributeExpressions - attribute expressions generated by the riot compiler
   * @param   {Object} scope - current scope
   * @param   {Object} currentProps - current component properties
   * @returns {Object} attributes key value pairs
   */

  function evaluateProps(element, attributeExpressions, scope, currentProps) {
    if (attributeExpressions === void 0) {
      attributeExpressions = [];
    }

    if (currentProps === void 0) {
      currentProps = {};
    }

    if (attributeExpressions.length) {
      return scope ? evaluateAttributeExpressions(attributeExpressions, scope) : currentProps;
    }

    return DOMattributesToObject(element);
  }
  /**
   * Create the bindings to update the component attributes
   * @param   {Array} attributes - list of attribute bindings
   * @returns {TemplateChunk} - template bindings object
   */


  function createAttributeBindings(attributes) {
    return create$6(null, [{
      expressions: (attributes || []).map(attr => {
        return Object.assign({
          type: expressionTypes.ATTRIBUTE
        }, attr);
      })
    }]);
  }
  /**
   * Create the subcomponents that can be included inside a tag in runtime
   * @param   {Object} components - components imported in runtime
   * @returns {Object} all the components transformed into Riot.Component factory functions
   */


  function createSubcomponents(components) {
    if (components === void 0) {
      components = {};
    }

    return Object.entries(callOrAssign(components)).reduce((acc, _ref4) => {
      let key = _ref4[0],
          value = _ref4[1];
      acc[camelToDashCase(key)] = createComponent(value);
      return acc;
    }, {});
  }
  /**
   * Run the component instance through all the plugins set by the user
   * @param   {Object} component - component instance
   * @returns {Object} the component enhanced by the plugins
   */


  function runPlugins(component) {
    return [...PLUGINS_SET].reduce((c, fn) => fn(c) || c, component);
  }
  /**
   * Compute the component current state merging it with its previous state
   * @param   {Object} oldState - previous state object
   * @param   {Object} newState - new state givent to the `update` call
   * @returns {Object} new object state
   */


  function computeState(oldState, newState) {
    return Object.assign({}, oldState, callOrAssign(newState));
  }
  /**
   * Add eventually the "is" attribute to link this DOM node to its css
   * @param {HTMLElement} element - target root node
   * @param {string} name - name of the component mounted
   * @returns {undefined} it's a void function
   */


  function addCssHook(element, name) {
    if (getName(element) !== name) {
      set(element, 'is', name);
    }
  }
  /**
   * Component creation factory function that will enhance the user provided API
   * @param   {Object} component - a component implementation previously defined
   * @param   {Array} options.slots - component slots generated via riot compiler
   * @param   {Array} options.attributes - attribute expressions generated via riot compiler
   * @returns {Riot.Component} a riot component instance
   */


  function enhanceComponentAPI(component, _ref5) {
    let slots = _ref5.slots,
        attributes = _ref5.attributes,
        props = _ref5.props;
    const attributeBindings = createAttributeBindings(attributes);
    const initialProps = callOrAssign(props);
    return autobindMethods(runPlugins(defineProperties(Object.create(component), {
      mount(element, state, parentScope) {
        if (state === void 0) {
          state = {};
        }

        this.props = Object.freeze(Object.assign({}, initialProps, evaluateProps(element, attributes, parentScope)));
        this.state = computeState(this.state, state);
        this[TEMPLATE_KEY_SYMBOL] = this.template.createDOM(element).clone();
        this[ATTRIBUTES_KEY_SYMBOL] = attributeBindings.createDOM(element).clone(); // link this object to the DOM node

        element[DOM_COMPONENT_INSTANCE_PROPERTY] = this; // add eventually the 'is' attribute

        component.name && addCssHook(element, component.name); // define the root element

        defineProperty(this, 'root', element); // before mount lifecycle event

        this.onBeforeMount(this.props, this.state); // handlte the template and its attributes

        this[ATTRIBUTES_KEY_SYMBOL].mount(element, parentScope);
        this[TEMPLATE_KEY_SYMBOL].mount(element, this); // create the slots and mount them

        this[SLOTS_KEY_SYMBOL] = createSlots(element, slots || []).mount(parentScope);
        this.onMounted(this.props, this.state);
        return this;
      },

      update(state, parentScope) {
        if (state === void 0) {
          state = {};
        }

        const newProps = evaluateProps(this.root, attributes, parentScope, this.props);
        if (this.shouldUpdate(newProps, this.props) === false) return;
        this.props = Object.freeze(Object.assign({}, initialProps, newProps));
        this.state = computeState(this.state, state);
        this.onBeforeUpdate(this.props, this.state);

        if (parentScope) {
          this[ATTRIBUTES_KEY_SYMBOL].update(parentScope);
          this[SLOTS_KEY_SYMBOL].update(parentScope);
        }

        this[TEMPLATE_KEY_SYMBOL].update(this);
        this.onUpdated(this.props, this.state);
        return this;
      },

      unmount(preserveRoot) {
        this.onBeforeUnmount(this.props, this.state);
        this[ATTRIBUTES_KEY_SYMBOL].unmount();
        this[SLOTS_KEY_SYMBOL].unmount();
        this[TEMPLATE_KEY_SYMBOL].unmount(this, !preserveRoot);
        this.onUnmounted(this.props, this.state);
        return this;
      }

    })), Object.keys(component).filter(prop => isFunction(component[prop])));
  }
  /**
   * Component initialization function starting from a DOM node
   * @param   {HTMLElement} element - element to upgrade
   * @param   {Object} initialProps - initial component properties
   * @param   {string} componentName - component id
   * @returns {Object} a new component instance bound to a DOM node
   */

  function mountComponent(element, initialProps, componentName) {
    const name = componentName || getName(element);
    if (!COMPONENTS_IMPLEMENTATION_MAP.has(name)) panic(`The component named "${name}" was never registered`);
    const component = COMPONENTS_IMPLEMENTATION_MAP.get(name)({
      props: initialProps
    });
    return component.mount(element);
  }

  /**
   * Similar to compose but performs from left-to-right function composition.<br/>
   * {@link https://30secondsofcode.org/function#composeright see also}
   * @param   {...[function]} fns) - list of unary function
   * @returns {*} result of the computation
   */
  /**
   * Performs right-to-left function composition.<br/>
   * Use Array.prototype.reduce() to perform right-to-left function composition.<br/>
   * The last (rightmost) function can accept one or more arguments; the remaining functions must be unary.<br/>
   * {@link https://30secondsofcode.org/function#compose original source code}
   * @param   {...[function]} fns) - list of unary function
   * @returns {*} result of the computation
   */

  function compose() {
    for (var _len2 = arguments.length, fns = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      fns[_key2] = arguments[_key2];
    }

    return fns.reduce((f, g) => function () {
      return f(g(...arguments));
    });
  }

  const DOM_COMPONENT_INSTANCE_PROPERTY$1 = DOM_COMPONENT_INSTANCE_PROPERTY,
        COMPONENTS_IMPLEMENTATION_MAP$1 = COMPONENTS_IMPLEMENTATION_MAP,
        PLUGINS_SET$1 = PLUGINS_SET;
  /**
   * Riot public api
   */

  /**
   * Register a custom tag by name
   * @param   {string} name - component name
   * @param   {Object} implementation - tag implementation
   * @returns {Map} map containing all the components implementations
   */

  function register(name, _ref) {
    let css = _ref.css,
        template = _ref.template,
        exports = _ref.exports;
    if (COMPONENTS_IMPLEMENTATION_MAP$1.has(name)) panic(`The component "${name}" was already registered`);
    COMPONENTS_IMPLEMENTATION_MAP$1.set(name, createComponent({
      name,
      css,
      template,
      exports
    }));
    return COMPONENTS_IMPLEMENTATION_MAP$1;
  }
  /**
   * Unregister a riot web component
   * @param   {string} name - component name
   * @returns {Map} map containing all the components implementations
   */

  function unregister(name) {
    if (!COMPONENTS_IMPLEMENTATION_MAP$1.has(name)) panic(`The component "${name}" was never registered`);
    COMPONENTS_IMPLEMENTATION_MAP$1.delete(name);
    cssManager.remove(name);
    return COMPONENTS_IMPLEMENTATION_MAP$1;
  }
  /**
   * Mounting function that will work only for the components that were globally registered
   * @param   {string|HTMLElement} selector - query for the selection or a DOM element
   * @param   {Object} initialProps - the initial component properties
   * @param   {string} name - optional component name
   * @returns {Array} list of nodes upgraded
   */

  function mount(selector, initialProps, name) {
    return $(selector).map(element => mountComponent(element, initialProps, name));
  }
  /**
   * Sweet unmounting helper function for the DOM node mounted manually by the user
   * @param   {string|HTMLElement} selector - query for the selection or a DOM element
   * @returns {Array} list of nodes unmounted
   */

  function unmount(selector) {
    return $(selector).map(element => {
      if (element[DOM_COMPONENT_INSTANCE_PROPERTY$1]) {
        element[DOM_COMPONENT_INSTANCE_PROPERTY$1].unmount();
      }

      return element;
    });
  }
  /**
   * Define a riot plugin
   * @param   {Function} plugin - function that will receive all the components created
   * @returns {Set} the set containing all the plugins installed
   */

  function install(plugin) {
    if (!isFunction(plugin)) panic('Plugins must be of type function');
    if (PLUGINS_SET$1.has(plugin)) panic('This plugin was already install');
    PLUGINS_SET$1.add(plugin);
    return PLUGINS_SET$1;
  }
  /**
   * Uninstall a riot plugin
   * @param   {Function} plugin - plugin previously installed
   * @returns {Set} the set containing all the plugins installed
   */

  function uninstall(plugin) {
    if (!PLUGINS_SET$1.has(plugin)) panic('This plugin was never installed');
    PLUGINS_SET$1.delete(plugin);
    return PLUGINS_SET$1;
  }
  /**
   * Helpter method to create component without relying on the registered ones
   * @param   {Object} implementation - component implementation
   * @returns {Function} function that will allow you to mount a riot component on a DOM node
   */

  function component(implementation) {
    return (el, props) => compose(c => c.mount(el), c => c({
      props
    }), createComponent)(implementation);
  }
  /** @type {string} current riot version */

  const version = 'v4.0.0-rc.5'; // expose some internal stuff that might be used from external tools

  const __ = {
    cssManager,
    defineComponent,
    globals
  };

  exports.__ = __;
  exports.component = component;
  exports.install = install;
  exports.mount = mount;
  exports.register = register;
  exports.uninstall = uninstall;
  exports.unmount = unmount;
  exports.unregister = unregister;
  exports.version = version;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
