/* Riot v9.1.1, @license MIT */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.riot = {}));
})(this, (function (exports) { 'use strict';

  const EACH = 0;
  const IF = 1;
  const SIMPLE = 2;
  const TAG = 3;
  const SLOT = 4;

  const bindingTypes = {
    EACH,
    IF,
    SIMPLE,
    TAG,
    SLOT,
  };

  /**
   * Quick type checking
   * @param   {*} element - anything
   * @param   {string} type - type definition
   * @returns {boolean} true if the type corresponds
   */
  function checkType(element, type) {
    return typeof element === type
  }

  /**
   * Check if an element is part of an svg
   * @param   {HTMLElement}  el - element to check
   * @returns {boolean} true if we are in an svg context
   */
  function isSvg(el) {
    const owner = el.ownerSVGElement;

    return !!owner || owner === null
  }

  /**
   * Check if an element is a template tag
   * @param   {HTMLElement}  el - element to check
   * @returns {boolean} true if it's a <template>
   */
  function isTemplate(el) {
    return el.tagName.toLowerCase() === 'template'
  }

  /**
   * Check that will be passed if its argument is a function
   * @param   {*} value - value to check
   * @returns {boolean} - true if the value is a function
   */
  function isFunction(value) {
    return checkType(value, 'function')
  }

  /**
   * Check if a value is a Boolean
   * @param   {*}  value - anything
   * @returns {boolean} true only for the value is a boolean
   */
  function isBoolean(value) {
    return checkType(value, 'boolean')
  }

  /**
   * Check if a value is an Object
   * @param   {*}  value - anything
   * @returns {boolean} true only for the value is an object
   */
  function isObject(value) {
    return !isNil(value) && value.constructor === Object
  }

  /**
   * Check if a value is null or undefined
   * @param   {*}  value - anything
   * @returns {boolean} true only for the 'undefined' and 'null' types
   */
  function isNil(value) {
    return value === null || value === undefined
  }

  // Riot.js constants that can be used across more modules

  const COMPONENTS_IMPLEMENTATION_MAP = new Map(),
    DOM_COMPONENT_INSTANCE_PROPERTY = Symbol('riot-component'),
    PLUGINS_SET = new Set(),
    IS_DIRECTIVE = 'is',
    MOUNT_METHOD_KEY = 'mount',
    UPDATE_METHOD_KEY = 'update',
    UNMOUNT_METHOD_KEY = 'unmount',
    SHOULD_UPDATE_KEY = 'shouldUpdate',
    ON_BEFORE_MOUNT_KEY = 'onBeforeMount',
    ON_MOUNTED_KEY = 'onMounted',
    ON_BEFORE_UPDATE_KEY = 'onBeforeUpdate',
    ON_UPDATED_KEY = 'onUpdated',
    ON_BEFORE_UNMOUNT_KEY = 'onBeforeUnmount',
    ON_UNMOUNTED_KEY = 'onUnmounted',
    PROPS_KEY = 'props',
    STATE_KEY = 'state',
    SLOTS_KEY = 'slots',
    ROOT_KEY = 'root',
    IS_PURE_SYMBOL = Symbol('pure'),
    IS_COMPONENT_UPDATING = Symbol('is_updating'),
    PARENT_KEY_SYMBOL = Symbol('parent'),
    ATTRIBUTES_KEY_SYMBOL = Symbol('attributes'),
    TEMPLATE_KEY_SYMBOL = Symbol('template');

  /**
   * Convert a string from camel case to dash-case
   * @param   {string} string - probably a component tag name
   * @returns {string} component name normalized
   */
  function camelToDashCase(string) {
    return string.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
  }

  /**
   * Convert a string containing dashes to camel case
   * @param   {string} string - input string
   * @returns {string} my-string -> myString
   */
  function dashToCamelCase(string) {
    return string.replace(/-(\w)/g, (_, c) => c.toUpperCase())
  }

  /**
   * Get all the element attributes as object
   * @param   {HTMLElement} element - DOM node we want to parse
   * @returns {Object} all the attributes found as a key value pairs
   */
  function DOMattributesToObject(element) {
    return Array.from(element.attributes).reduce((acc, attribute) => {
      acc[dashToCamelCase(attribute.name)] = attribute.value;
      return acc
    }, {})
  }

  /**
   * Move all the child nodes from a source tag to another
   * @param   {HTMLElement} source - source node
   * @param   {HTMLElement} target - target node
   * @returns {undefined} it's a void method ¯\_(ツ)_/¯
   */

  // Ignore this helper because it's needed only for svg tags
  function moveChildren(source, target) {
    // eslint-disable-next-line fp/no-loops
    while (source.firstChild) target.appendChild(source.firstChild);
  }

  /**
   * Remove the child nodes from any DOM node
   * @param   {HTMLElement} node - target node
   * @returns {undefined}
   */
  function cleanNode(node) {
    // eslint-disable-next-line fp/no-loops
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  /**
   * Clear multiple children in a node
   * @param   {HTMLElement[]} children - direct children nodes
   * @returns {undefined}
   */
  function clearChildren(children) {
    // eslint-disable-next-line fp/no-loops,fp/no-let
    for (let i = 0; i < children.length; i++) removeChild(children[i]);
  }

  /**
   * Remove a node
   * @param {HTMLElement}node - node to remove
   * @returns {undefined}
   */
  const removeChild = (node) => node.remove();

  /**
   * Insert before a node
   * @param {HTMLElement} newNode - node to insert
   * @param {HTMLElement} refNode - ref child
   * @returns {undefined}
   */
  const insertBefore = (newNode, refNode) =>
    refNode &&
    refNode.parentNode &&
    refNode.parentNode.insertBefore(newNode, refNode);

  /**
   * Replace a node
   * @param {HTMLElement} newNode - new node to add to the DOM
   * @param {HTMLElement} replaced - node to replace
   * @returns {undefined}
   */
  const replaceChild = (newNode, replaced) =>
    replaced &&
    replaced.parentNode &&
    replaced.parentNode.replaceChild(newNode, replaced);

  const ATTRIBUTE = 0;
  const EVENT = 1;
  const TEXT = 2;
  const VALUE = 3;

  const expressionTypes = {
    ATTRIBUTE,
    EVENT,
    TEXT,
    VALUE,
  };

  // does simply nothing
  function noop() {
    return this
  }

  /**
   * Autobind the methods of a source object to itself
   * @param   {Object} source - probably a riot tag instance
   * @param   {Array<string>} methods - list of the methods to autobind
   * @returns {Object} the original object received
   */
  function autobindMethods(source, methods) {
    methods.forEach((method) => {
      source[method] = source[method].bind(source);
    });

    return source
  }

  /**
   * Call the first argument received only if it's a function otherwise return it as it is
   * @param   {*} source - anything
   * @returns {*} anything
   */
  function callOrAssign(source) {
    return isFunction(source)
      ? source.prototype && source.prototype.constructor
        ? new source()
        : source()
      : source
  }

  /**
   * Throw an error with a descriptive message
   * @param   { string } message - error message
   * @param   { string } cause - optional error cause object
   * @returns { undefined } hoppla... at this point the program should stop working
   */
  function panic(message, cause) {
    throw new Error(message, { cause })
  }
  /**
   * Returns the memoized (cached) function.
   * // borrowed from https://www.30secondsofcode.org/js/s/memoize
   * @param {Function} fn - function to memoize
   * @returns {Function} memoize function
   */
  function memoize(fn) {
    const cache = new Map();
    const cached = (val) => {
      return cache.has(val)
        ? cache.get(val)
        : cache.set(val, fn.call(this, val)) && cache.get(val)
    };
    cached.cache = cache;
    return cached
  }

  /**
   * Evaluate a list of attribute expressions
   * @param   {Array} attributes - attribute expressions generated by the riot compiler
   * @returns {Object} key value pairs with the result of the computation
   */
  function evaluateAttributeExpressions(attributes) {
    return attributes.reduce((acc, attribute) => {
      const { value, type } = attribute;

      switch (true) {
        // spread attribute
        case !attribute.name && type === ATTRIBUTE:
          return {
            ...acc,
            ...value,
          }
        // value attribute
        case type === VALUE:
          acc.value = attribute.value;
          break
        // normal attributes
        default:
          acc[dashToCamelCase(attribute.name)] = attribute.value;
      }

      return acc
    }, {})
  }

  /**
   * Helper function to set an immutable property
   * @param   {Object} source - object where the new property will be set
   * @param   {string} key - object key where the new property will be stored
   * @param   {*} value - value of the new property
   * @param   {Object} options - set the property overriding the default options
   * @returns {Object} - the original object modified
   */
  function defineProperty(source, key, value, options = {}) {
    /* eslint-disable fp/no-mutating-methods */
    Object.defineProperty(source, key, {
      value,
      enumerable: false,
      writable: false,
      configurable: true,
      ...options,
    });
    /* eslint-enable fp/no-mutating-methods */

    return source
  }

  /**
   * Define multiple properties on a target object
   * @param   {Object} source - object where the new properties will be set
   * @param   {Object} properties - object containing as key pair the key + value properties
   * @param   {Object} options - set the property overriding the default options
   * @returns {Object} the original object modified
   */
  function defineProperties(source, properties, options) {
    Object.entries(properties).forEach(([key, value]) => {
      defineProperty(source, key, value, options);
    });

    return source
  }

  /**
   * Define default properties if they don't exist on the source object
   * @param   {Object} source - object that will receive the default properties
   * @param   {Object} defaults - object containing additional optional keys
   * @returns {Object} the original object received enhanced
   */
  function defineDefaults(source, defaults) {
    Object.entries(defaults).forEach(([key, value]) => {
      if (!source[key]) source[key] = value;
    });

    return source
  }

  // Components without template use a mocked template interface with some basic functionalities to
  // guarantee consistent rendering behaviour see https://github.com/riot/riot/issues/2984
  const MOCKED_TEMPLATE_INTERFACE = {
    [MOUNT_METHOD_KEY](el) {
      this.el = el;
    },
    [UPDATE_METHOD_KEY]: noop,
    [UNMOUNT_METHOD_KEY](_, __, mustRemoveRoot = false) {
      if (mustRemoveRoot) removeChild(this.el);
      else if (!mustRemoveRoot) cleanNode(this.el);
    },
    clone: noop,
    createDOM: noop,
  };

  const HEAD_SYMBOL = Symbol();
  const TAIL_SYMBOL = Symbol();

  /**
   * Create the <template> fragments text nodes
   * @return {Object} {{head: Text, tail: Text}}
   */
  function createHeadTailPlaceholders() {
    const head = document.createTextNode('');
    const tail = document.createTextNode('');

    head[HEAD_SYMBOL] = true;
    tail[TAIL_SYMBOL] = true;

    return { head, tail }
  }

  /**
   * Create the template meta object in case of <template> fragments
   * @param   {TemplateChunk} componentTemplate - template chunk object
   * @returns {Object} the meta property that will be passed to the mount function of the TemplateChunk
   */
  function createTemplateMeta(componentTemplate) {
    const fragment = componentTemplate.dom.cloneNode(true);
    const { head, tail } = createHeadTailPlaceholders();

    return {
      avoidDOMInjection: true,
      fragment,
      head,
      tail,
      children: [head, ...Array.from(fragment.childNodes), tail],
    }
  }

  /* c8 ignore start */
  /**
   * ISC License
   *
   * Copyright (c) 2020, Andrea Giammarchi, @WebReflection
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
   * REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
   * AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
   * INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
   * LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE
   * OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
   * PERFORMANCE OF THIS SOFTWARE.
   */

  // fork of https://github.com/WebReflection/udomdiff version 1.1.0
  // due to https://github.com/WebReflection/udomdiff/pull/2
  /* eslint-disable */

  /**
   * @param {Node[]} a The list of current/live children
   * @param {Node[]} b The list of future children
   * @param {(entry: Node, action: number) => Node} get
   * The callback invoked per each entry related DOM operation.
   * @param {Node} [before] The optional node used as anchor to insert before.
   * @returns {Node[]} The same list of future children.
   */
  const udomdiff = (a, b, get, before) => {
    const bLength = b.length;
    let aEnd = a.length;
    let bEnd = bLength;
    let aStart = 0;
    let bStart = 0;
    let map = null;
    while (aStart < aEnd || bStart < bEnd) {
      // append head, tail, or nodes in between: fast path
      if (aEnd === aStart) {
        // we could be in a situation where the rest of nodes that
        // need to be added are not at the end, and in such case
        // the node to `insertBefore`, if the index is more than 0
        // must be retrieved, otherwise it's gonna be the first item.
        const node =
          bEnd < bLength
            ? bStart
              ? get(b[bStart - 1], -0).nextSibling
              : get(b[bEnd - bStart], 0)
            : before;
        while (bStart < bEnd) insertBefore(get(b[bStart++], 1), node);
      }
      // remove head or tail: fast path
      else if (bEnd === bStart) {
        while (aStart < aEnd) {
          // remove the node only if it's unknown or not live
          if (!map || !map.has(a[aStart])) removeChild(get(a[aStart], -1));
          aStart++;
        }
      }
      // same node: fast path
      else if (a[aStart] === b[bStart]) {
        aStart++;
        bStart++;
      }
      // same tail: fast path
      else if (a[aEnd - 1] === b[bEnd - 1]) {
        aEnd--;
        bEnd--;
      }
      // The once here single last swap "fast path" has been removed in v1.1.0
      // https://github.com/WebReflection/udomdiff/blob/single-final-swap/esm/index.js#L69-L85
      // reverse swap: also fast path
      else if (a[aStart] === b[bEnd - 1] && b[bStart] === a[aEnd - 1]) {
        // this is a "shrink" operation that could happen in these cases:
        // [1, 2, 3, 4, 5]
        // [1, 4, 3, 2, 5]
        // or asymmetric too
        // [1, 2, 3, 4, 5]
        // [1, 2, 3, 5, 6, 4]
        const node = get(a[--aEnd], -1).nextSibling;
        insertBefore(get(b[bStart++], 1), get(a[aStart++], -1).nextSibling);
        insertBefore(get(b[--bEnd], 1), node);
        // mark the future index as identical (yeah, it's dirty, but cheap 👍)
        // The main reason to do this, is that when a[aEnd] will be reached,
        // the loop will likely be on the fast path, as identical to b[bEnd].
        // In the best case scenario, the next loop will skip the tail,
        // but in the worst one, this node will be considered as already
        // processed, bailing out pretty quickly from the map index check
        a[aEnd] = b[bEnd];
      }
      // map based fallback, "slow" path
      else {
        // the map requires an O(bEnd - bStart) operation once
        // to store all future nodes indexes for later purposes.
        // In the worst case scenario, this is a full O(N) cost,
        // and such scenario happens at least when all nodes are different,
        // but also if both first and last items of the lists are different
        if (!map) {
          map = new Map();
          let i = bStart;
          while (i < bEnd) map.set(b[i], i++);
        }
        // if it's a future node, hence it needs some handling
        if (map.has(a[aStart])) {
          // grab the index of such node, 'cause it might have been processed
          const index = map.get(a[aStart]);
          // if it's not already processed, look on demand for the next LCS
          if (bStart < index && index < bEnd) {
            let i = aStart;
            // counts the amount of nodes that are the same in the future
            let sequence = 1;
            while (++i < aEnd && i < bEnd && map.get(a[i]) === index + sequence)
              sequence++;
            // effort decision here: if the sequence is longer than replaces
            // needed to reach such sequence, which would brings again this loop
            // to the fast path, prepend the difference before a sequence,
            // and move only the future list index forward, so that aStart
            // and bStart will be aligned again, hence on the fast path.
            // An example considering aStart and bStart are both 0:
            // a: [1, 2, 3, 4]
            // b: [7, 1, 2, 3, 6]
            // this would place 7 before 1 and, from that time on, 1, 2, and 3
            // will be processed at zero cost
            if (sequence > index - bStart) {
              const node = get(a[aStart], 0);
              while (bStart < index) insertBefore(get(b[bStart++], 1), node);
            }
            // if the effort wasn't good enough, fallback to a replace,
            // moving both source and target indexes forward, hoping that some
            // similar node will be found later on, to go back to the fast path
            else {
              replaceChild(get(b[bStart++], 1), get(a[aStart++], -1));
            }
          }
          // otherwise move the source forward, 'cause there's nothing to do
          else aStart++;
        }
        // this node has no meaning in the future list, so it's more than safe
        // to remove it, and check the next live node out instead, meaning
        // that only the live list index should be forwarded
        else removeChild(get(a[aStart++], -1));
      }
    }
    return b
  };

  const UNMOUNT_SCOPE = Symbol('unmount');

  const EachBinding = {
    // dynamic binding properties
    // childrenMap: null,
    // node: null,
    // root: null,
    // condition: null,
    // evaluate: null,
    // template: null,
    // isTemplateTag: false,
    nodes: [],
    // getKey: null,
    // indexName: null,
    // itemName: null,
    // afterPlaceholder: null,
    // placeholder: null,

    // API methods
    mount(scope, parentScope) {
      return this.update(scope, parentScope)
    },
    update(scope, parentScope) {
      const { placeholder, nodes, childrenMap } = this;
      const collection = scope === UNMOUNT_SCOPE ? null : this.evaluate(scope);
      const items = collection ? Array.from(collection) : [];

      // prepare the diffing
      const { newChildrenMap, batches, futureNodes } = createPatch(
        items,
        scope,
        parentScope,
        this,
      );

      // patch the DOM only if there are new nodes
      udomdiff(
        nodes,
        futureNodes,
        patch(Array.from(childrenMap.values()), parentScope),
        placeholder,
      );

      // trigger the mounts and the updates
      batches.forEach((fn) => fn());

      // update the children map
      this.childrenMap = newChildrenMap;
      this.nodes = futureNodes;

      return this
    },
    unmount(scope, parentScope) {
      this.update(UNMOUNT_SCOPE, parentScope);

      return this
    },
  };

  /**
   * Patch the DOM while diffing
   * @param   {any[]} redundant - list of all the children (template, nodes, context) added via each
   * @param   {*} parentScope - scope of the parent template
   * @returns {Function} patch function used by domdiff
   */
  function patch(redundant, parentScope) {
    return (item, info) => {
      if (info < 0) {
        // get the last element added to the childrenMap saved previously
        const element = redundant[redundant.length - 1];

        if (element) {
          // get the nodes and the template in stored in the last child of the childrenMap
          const { template, nodes, context } = element;
          // remove the last node (notice <template> tags might have more children nodes)
          nodes.pop();

          // notice that we pass null as last argument because
          // the root node and its children will be removed by domdiff
          if (!nodes.length) {
            // we have cleared all the children nodes and we can unmount this template
            redundant.pop();
            template.unmount(context, parentScope, null);
          }
        }
      }

      return item
    }
  }

  /**
   * Check whether a template must be filtered from a loop
   * @param   {Function} condition - filter function
   * @param   {Object} context - argument passed to the filter function
   * @returns {boolean} true if this item should be skipped
   */
  function mustFilterItem(condition, context) {
    return condition ? !condition(context) : false
  }

  /**
   * Extend the scope of the looped template
   * @param   {Object} scope - current template scope
   * @param   {Object} options - options
   * @param   {string} options.itemName - key to identify the looped item in the new context
   * @param   {string} options.indexName - key to identify the index of the looped item
   * @param   {number} options.index - current index
   * @param   {*} options.item - collection item looped
   * @returns {Object} enhanced scope object
   */
  function extendScope(scope, { itemName, indexName, index, item }) {
    defineProperty(scope, itemName, item);
    if (indexName) defineProperty(scope, indexName, index);

    return scope
  }

  /**
   * Loop the current template items
   * @param   {Array} items - expression collection value
   * @param   {*} scope - template scope
   * @param   {*} parentScope - scope of the parent template
   * @param   {EachBinding} binding - each binding object instance
   * @returns {Object} data
   * @returns {Map} data.newChildrenMap - a Map containing the new children template structure
   * @returns {Array} data.batches - array containing the template lifecycle functions to trigger
   * @returns {Array} data.futureNodes - array containing the nodes we need to diff
   */
  function createPatch(items, scope, parentScope, binding) {
    const {
      condition,
      template,
      childrenMap,
      itemName,
      getKey,
      indexName,
      root,
      isTemplateTag,
    } = binding;
    const newChildrenMap = new Map();
    const batches = [];
    const futureNodes = [];

    items.forEach((item, index) => {
      const context = extendScope(Object.create(scope), {
        itemName,
        indexName,
        index,
        item,
      });
      const key = getKey ? getKey(context) : index;
      const oldItem = childrenMap.get(key);
      const nodes = [];

      if (mustFilterItem(condition, context)) {
        return
      }

      const mustMount = !oldItem;
      const componentTemplate = oldItem ? oldItem.template : template.clone();
      const el = componentTemplate.el || root.cloneNode();
      const meta =
        isTemplateTag && mustMount
          ? createTemplateMeta(componentTemplate)
          : componentTemplate.meta;

      if (mustMount) {
        batches.push(() =>
          componentTemplate.mount(el, context, parentScope, meta),
        );
      } else {
        batches.push(() => componentTemplate.update(context, parentScope));
      }

      // create the collection of nodes to update or to add
      // in case of template tags we need to add all its children nodes
      if (isTemplateTag) {
        nodes.push(...meta.children);
      } else {
        nodes.push(el);
      }

      // delete the old item from the children map
      childrenMap.delete(key);
      futureNodes.push(...nodes);

      // update the children map
      newChildrenMap.set(key, {
        nodes,
        template: componentTemplate,
        context,
        index,
      });
    });

    return {
      newChildrenMap,
      batches,
      futureNodes,
    }
  }

  function create$6(
    node,
    { evaluate, condition, itemName, indexName, getKey, template },
  ) {
    const placeholder = document.createTextNode('');
    const root = node.cloneNode();

    insertBefore(placeholder, node);
    removeChild(node);

    return {
      ...EachBinding,
      childrenMap: new Map(),
      node,
      root,
      condition,
      evaluate,
      isTemplateTag: isTemplate(root),
      template: template.createDOM(node),
      getKey,
      indexName,
      itemName,
      placeholder,
    }
  }

  /**
   * Binding responsible for the `if` directive
   */
  const IfBinding = {
    // dynamic binding properties
    // node: null,
    // evaluate: null,
    // isTemplateTag: false,
    // placeholder: null,
    // template: null,

    // API methods
    mount(scope, parentScope) {
      return this.update(scope, parentScope)
    },
    update(scope, parentScope) {
      const value = !!this.evaluate(scope);
      const mustMount = !this.value && value;
      const mustUnmount = this.value && !value;
      const mount = () => {
        const pristine = this.node.cloneNode();

        insertBefore(pristine, this.placeholder);
        this.template = this.template.clone();
        this.template.mount(pristine, scope, parentScope);
      };

      switch (true) {
        case mustMount:
          mount();
          break
        case mustUnmount:
          this.unmount(scope);
          break
        default:
          if (value) this.template.update(scope, parentScope);
      }

      this.value = value;

      return this
    },
    unmount(scope, parentScope) {
      this.template.unmount(scope, parentScope, true);

      return this
    },
  };

  function create$5(node, { evaluate, template }) {
    const placeholder = document.createTextNode('');

    insertBefore(placeholder, node);
    removeChild(node);

    return {
      ...IfBinding,
      node,
      evaluate,
      placeholder,
      template: template.createDOM(node),
    }
  }

  const ElementProto = typeof Element === 'undefined' ? {} : Element.prototype;
  const isNativeHtmlProperty = memoize(
    (name) => ElementProto.hasOwnProperty(name), // eslint-disable-line
  );

  /**
   * Add all the attributes provided
   * @param   {HTMLElement} node - target node
   * @param   {Object} attributes - object containing the attributes names and values
   * @returns {undefined} sorry it's a void function :(
   */
  function setAllAttributes(node, attributes) {
    Object.entries(attributes).forEach(([name, value]) =>
      attributeExpression(node, { name }, value),
    );
  }

  /**
   * Remove all the attributes provided
   * @param   {HTMLElement} node - target node
   * @param   {Object} newAttributes - object containing all the new attribute names
   * @param   {Object} oldAttributes - object containing all the old attribute names
   * @returns {undefined} sorry it's a void function :(
   */
  function removeAllAttributes(node, newAttributes, oldAttributes) {
    const newKeys = newAttributes ? Object.keys(newAttributes) : [];

    Object.keys(oldAttributes)
      .filter((name) => !newKeys.includes(name))
      .forEach((attribute) => node.removeAttribute(attribute));
  }

  /**
   * Check whether the attribute value can be rendered
   * @param {*} value - expression value
   * @returns {boolean} true if we can render this attribute value
   */
  function canRenderAttribute(value) {
    return ['string', 'number', 'boolean'].includes(typeof value)
  }

  /**
   * Check whether the attribute should be removed
   * @param {*} value - expression value
   * @param   {boolean} isBoolean - flag to handle boolean attributes
   * @returns {boolean} boolean - true if the attribute can be removed}
   */
  function shouldRemoveAttribute(value, isBoolean) {
    // boolean attributes should be removed if the value is falsy
    if (isBoolean) return !value && value !== 0
    // otherwise we can try to render it
    return typeof value === 'undefined' || value === null
  }

  /**
   * This methods handles the DOM attributes updates
   * @param   {HTMLElement} node - target node
   * @param   {Object} expression - expression object
   * @param   {string} expression.name - attribute name
   * @param   {boolean} expression.isBoolean - flag to handle boolean attributes
   * @param   {*} value - new expression value
   * @param   {*} oldValue - the old expression cached value
   * @returns {undefined}
   */
  function attributeExpression(
    node,
    { name, isBoolean: isBoolean$1 },
    value,
    oldValue,
  ) {
    // is it a spread operator? {...attributes}
    if (!name) {
      if (oldValue) {
        // remove all the old attributes
        removeAllAttributes(node, value, oldValue);
      }

      // is the value still truthy?
      if (value) {
        setAllAttributes(node, value);
      }

      return
    }

    // store the attribute on the node to make it compatible with native custom elements
    if (
      !isNativeHtmlProperty(name) &&
      (isBoolean(value) || isObject(value) || isFunction(value))
    ) {
      node[name] = value;
    }

    if (shouldRemoveAttribute(value, isBoolean$1)) {
      node.removeAttribute(name);
    } else if (canRenderAttribute(value)) {
      node.setAttribute(name, normalizeValue(name, value, isBoolean$1));
    }
  }

  /**
   * Get the value as string
   * @param   {string} name - attribute name
   * @param   {*} value - user input value
   * @param   {boolean} isBoolean - boolean attributes flag
   * @returns {string} input value as string
   */
  function normalizeValue(name, value, isBoolean) {
    // be sure that expressions like selected={ true } will always be rendered as selected='selected'
    // fix https://github.com/riot/riot/issues/2975
    return value === true && isBoolean ? name : value
  }

  const RE_EVENTS_PREFIX = /^on/;

  const getCallbackAndOptions = (value) =>
    Array.isArray(value) ? value : [value, false];

  // see also https://medium.com/@WebReflection/dom-handleevent-a-cross-platform-standard-since-year-2000-5bf17287fd38
  const EventListener = {
    handleEvent(event) {
      this[event.type](event);
    },
  };
  const ListenersWeakMap = new WeakMap();

  const createListener = (node) => {
    const listener = Object.create(EventListener);
    ListenersWeakMap.set(node, listener);
    return listener
  };

  /**
   * Set a new event listener
   * @param   {HTMLElement} node - target node
   * @param   {Object} expression - expression object
   * @param   {string} expression.name - event name
   * @param   {*} value - new expression value
   * @returns {value} the callback just received
   */
  function eventExpression(node, { name }, value) {
    const normalizedEventName = name.replace(RE_EVENTS_PREFIX, '');
    const eventListener = ListenersWeakMap.get(node) || createListener(node);
    const [callback, options] = getCallbackAndOptions(value);
    const handler = eventListener[normalizedEventName];
    const mustRemoveEvent = handler && !callback;
    const mustAddEvent = callback && !handler;

    if (mustRemoveEvent) {
      node.removeEventListener(normalizedEventName, eventListener);
    }

    if (mustAddEvent) {
      node.addEventListener(normalizedEventName, eventListener, options);
    }

    eventListener[normalizedEventName] = callback;
  }

  /**
   * Normalize the user value in order to render a empty string in case of falsy values
   * @param   {*} value - user input value
   * @returns {string} hopefully a string
   */
  function normalizeStringValue(value) {
    return isNil(value) ? '' : value
  }

  /**
   * Get the the target text node to update or create one from of a comment node
   * @param   {HTMLElement} node - any html element containing childNodes
   * @param   {number} childNodeIndex - index of the text node in the childNodes list
   * @returns {Text} the text node to update
   */
  const getTextNode = (node, childNodeIndex) => {
    const target = node.childNodes[childNodeIndex];

    if (target.nodeType === Node.COMMENT_NODE) {
      const textNode = document.createTextNode('');
      node.replaceChild(textNode, target);

      return textNode
    }

    return target
  };

  /**
   * This methods handles a simple text expression update
   * @param   {HTMLElement} node - target node
   * @param   {Object} data - expression object
   * @param   {*} value - new expression value
   * @returns {undefined}
   */
  function textExpression(node, data, value) {
    node.data = normalizeStringValue(value);
  }

  /**
   * This methods handles the input fields value updates
   * @param   {HTMLElement} node - target node
   * @param   {Object} expression - expression object
   * @param   {*} value - new expression value
   * @returns {undefined}
   */
  function valueExpression(node, expression, value) {
    node.value = normalizeStringValue(value);
  }

  const expressions = {
    [ATTRIBUTE]: attributeExpression,
    [EVENT]: eventExpression,
    [TEXT]: textExpression,
    [VALUE]: valueExpression,
  };

  const Expression = {
    // Static props
    // node: null,
    // value: null,

    // API methods
    /**
     * Mount the expression evaluating its initial value
     * @param   {*} scope - argument passed to the expression to evaluate its current values
     * @returns {Expression} self
     */
    mount(scope) {
      // hopefully a pure function
      this.value = this.evaluate(scope);

      // IO() DOM updates
      apply(this, this.value);

      return this
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

      return this
    },
    /**
     * Expression teardown method
     * @returns {Expression} self
     */
    unmount() {
      // unmount only the event handling expressions
      if (this.type === EVENT) apply(this, null);

      return this
    },
  };

  /**
   * IO() function to handle the DOM updates
   * @param {Expression} expression - expression object
   * @param {*} value - current expression value
   * @returns {undefined}
   */
  function apply(expression, value) {
    return expressions[expression.type](
      expression.node,
      expression,
      value,
      expression.value,
    )
  }

  function create$4(node, data) {
    return {
      ...Expression,
      ...data,
      node: data.type === TEXT ? getTextNode(node, data.childNodeIndex) : node,
    }
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
      return {
        ...acc,
        [method]: (scope) => {
          return collection.map((item) => item[method](scope)) && context
        },
      }
    }, {})
  }

  function create$3(node, { expressions }) {
    return {
      ...flattenCollectionMethods(
        expressions.map((expression) => create$4(node, expression)),
        ['mount', 'update', 'unmount'],
      ),
    }
  }

  function extendParentScope(attributes, scope, parentScope) {
    if (!attributes || !attributes.length) return parentScope

    const expressions = attributes.map((attr) => ({
      ...attr,
      value: attr.evaluate(scope),
    }));

    return Object.assign(
      Object.create(parentScope || null),
      evaluateAttributeExpressions(expressions),
    )
  }

  // this function is only meant to fix an edge case
  // https://github.com/riot/riot/issues/2842
  const getRealParent = (scope, parentScope) =>
    scope[PARENT_KEY_SYMBOL] || parentScope;

  const SlotBinding = {
    // dynamic binding properties
    // node: null,
    // name: null,
    attributes: [],
    // template: null,

    getTemplateScope(scope, parentScope) {
      return extendParentScope(this.attributes, scope, parentScope)
    },

    // API methods
    mount(scope, parentScope) {
      const templateData = scope.slots
        ? scope.slots.find(({ id }) => id === this.name)
        : false;
      const { parentNode } = this.node;
      const realParent = getRealParent(scope, parentScope);

      this.template =
        templateData &&
        create(templateData.html, templateData.bindings).createDOM(parentNode);

      if (this.template) {
        cleanNode(this.node);
        this.template.mount(
          this.node,
          this.getTemplateScope(scope, realParent),
          realParent,
        );
        this.template.children = Array.from(this.node.childNodes);
      }

      moveSlotInnerContent(this.node);
      removeChild(this.node);

      return this
    },
    update(scope, parentScope) {
      if (this.template) {
        const realParent = getRealParent(scope, parentScope);
        this.template.update(this.getTemplateScope(scope, realParent), realParent);
      }

      return this
    },
    unmount(scope, parentScope, mustRemoveRoot) {
      if (this.template) {
        this.template.unmount(
          this.getTemplateScope(scope, parentScope),
          null,
          mustRemoveRoot,
        );
      }

      return this
    },
  };

  /**
   * Move the inner content of the slots outside of them
   * @param   {HTMLElement} slot - slot node
   * @returns {undefined} it's a void method ¯\_(ツ)_/¯
   */
  function moveSlotInnerContent(slot) {
    const child = slot && slot.firstChild;

    if (!child) return

    insertBefore(child, slot);
    moveSlotInnerContent(slot);
  }

  /**
   * Create a single slot binding
   * @param   {HTMLElement} node - slot node
   * @param   {string} name - slot id
   * @param   {AttributeExpressionData[]} attributes - slot attributes
   * @returns {Object} Slot binding object
   */
  function createSlot(node, { name, attributes }) {
    return {
      ...SlotBinding,
      attributes,
      node,
      name,
    }
  }

  /**
   * Create a new tag object if it was registered before, otherwise fallback to the simple
   * template chunk
   * @param   {Function} component - component factory function
   * @param   {Array<Object>} slots - array containing the slots markup
   * @param   {Array} attributes - dynamic attributes that will be received by the tag element
   * @returns {TagImplementation|TemplateChunk} a tag implementation or a template chunk as fallback
   */
  function getTag(component, slots = [], attributes = []) {
    // if this tag was registered before we will return its implementation
    if (component) {
      return component({ slots, attributes })
    }

    // otherwise we return a template chunk
    return create(slotsToMarkup(slots), [
      ...slotBindings(slots),
      {
        // the attributes should be registered as binding
        // if we fallback to a normal template chunk
        expressions: attributes.map((attr) => {
          return {
            type: ATTRIBUTE,
            ...attr,
          }
        }),
      },
    ])
  }

  /**
   * Merge all the slots bindings into a single array
   * @param   {Array<Object>} slots - slots collection
   * @returns {Array<Bindings>} flatten bindings array
   */
  function slotBindings(slots) {
    return slots.reduce((acc, { bindings }) => acc.concat(bindings), [])
  }

  /**
   * Merge all the slots together in a single markup string
   * @param   {Array<Object>} slots - slots collection
   * @returns {string} markup of all the slots in a single string
   */
  function slotsToMarkup(slots) {
    return slots.reduce((acc, slot) => {
      return acc + slot.html
    }, '')
  }

  const TagBinding = {
    // dynamic binding properties
    // node: null,
    // evaluate: null,
    // name: null,
    // slots: null,
    // tag: null,
    // attributes: null,
    // getComponent: null,

    mount(scope) {
      return this.update(scope)
    },
    update(scope, parentScope) {
      const name = this.evaluate(scope);

      // simple update
      if (name && name === this.name) {
        this.tag.update(scope);
      } else {
        // unmount the old tag if it exists
        this.unmount(scope, parentScope, true);

        // mount the new tag
        this.name = name;
        this.tag = getTag(this.getComponent(name), this.slots, this.attributes);
        this.tag.mount(this.node, scope);
      }

      return this
    },
    unmount(scope, parentScope, keepRootTag) {
      if (this.tag) {
        // keep the root tag
        this.tag.unmount(keepRootTag);
      }

      return this
    },
  };

  function create$2(
    node,
    { evaluate, getComponent, slots, attributes },
  ) {
    return {
      ...TagBinding,
      node,
      evaluate,
      slots,
      attributes,
      getComponent,
    }
  }

  const bindings = {
    [IF]: create$5,
    [SIMPLE]: create$3,
    [EACH]: create$6,
    [TAG]: create$2,
    [SLOT]: createSlot,
  };

  /**
   * Text expressions in a template tag will get childNodeIndex value normalized
   * depending on the position of the <template> tag offset
   * @param   {Expression[]} expressions - riot expressions array
   * @param   {number} textExpressionsOffset - offset of the <template> tag
   * @returns {Expression[]} expressions containing the text expressions normalized
   */
  function fixTextExpressionsOffset(expressions, textExpressionsOffset) {
    return expressions.map((e) =>
      e.type === TEXT
        ? {
            ...e,
            childNodeIndex: e.childNodeIndex + textExpressionsOffset,
          }
        : e,
    )
  }

  /**
   * Bind a new expression object to a DOM node
   * @param   {HTMLElement} root - DOM node where to bind the expression
   * @param   {TagBindingData} binding - binding data
   * @param   {number|null} templateTagOffset - if it's defined we need to fix the text expressions childNodeIndex offset
   * @returns {Binding} Binding object
   */
  function create$1(root, binding, templateTagOffset) {
    const { selector, type, redundantAttribute, expressions } = binding;
    // find the node to apply the bindings
    const node = selector ? root.querySelector(selector) : root;

    // remove eventually additional attributes created only to select this node
    if (redundantAttribute) node.removeAttribute(redundantAttribute);
    const bindingExpressions = expressions || [];

    // init the binding
    return (bindings[type] || bindings[SIMPLE])(node, {
      ...binding,
      expressions:
        templateTagOffset && !selector
          ? fixTextExpressionsOffset(bindingExpressions, templateTagOffset)
          : bindingExpressions,
    })
  }

  // in this case a simple innerHTML is enough
  function createHTMLTree(html, root) {
    const template = isTemplate(root) ? root : document.createElement('template');
    template.innerHTML = html;
    return template.content
  }

  // for svg nodes we need a bit more work
  /* c8 ignore start */
  function createSVGTree(html, container) {
    // create the SVGNode
    const svgNode = container.ownerDocument.importNode(
      new window.DOMParser().parseFromString(
        `<svg xmlns="http://www.w3.org/2000/svg">${html}</svg>`,
        'application/xml',
      ).documentElement,
      true,
    );

    return svgNode
  }
  /* c8 ignore end */

  /**
   * Create the DOM that will be injected
   * @param {Object} root - DOM node to find out the context where the fragment will be created
   * @param   {string} html - DOM to create as string
   * @returns {HTMLDocumentFragment|HTMLElement} a new html fragment
   */
  function createDOMTree(root, html) {
    /* c8 ignore next */
    if (isSvg(root)) return createSVGTree(html, root)

    return createHTMLTree(html, root)
  }

  /**
   * Inject the DOM tree into a target node
   * @param   {HTMLElement} el - target element
   * @param   {DocumentFragment|SVGElement} dom - dom tree to inject
   * @returns {undefined}
   */
  function injectDOM(el, dom) {
    switch (true) {
      case isSvg(el):
        moveChildren(dom, el);
        break
      case isTemplate(el):
        el.parentNode.replaceChild(dom, el);
        break
      default:
        el.appendChild(dom);
    }
  }

  /**
   * Create the Template DOM skeleton
   * @param   {HTMLElement} el - root node where the DOM will be injected
   * @param   {string|HTMLElement} html - HTML markup or HTMLElement that will be injected into the root node
   * @returns {?DocumentFragment} fragment that will be injected into the root node
   */
  function createTemplateDOM(el, html) {
    return html && (typeof html === 'string' ? createDOMTree(el, html) : html)
  }

  /**
   * Get the offset of the <template> tag
   * @param {HTMLElement} parentNode - template tag parent node
   * @param {HTMLElement} el - the template tag we want to render
   * @param   {Object} meta - meta properties needed to handle the <template> tags in loops
   * @returns {number} offset of the <template> tag calculated from its siblings DOM nodes
   */
  function getTemplateTagOffset(parentNode, el, meta) {
    const siblings = Array.from(parentNode.childNodes);

    return Math.max(siblings.indexOf(el), siblings.indexOf(meta.head) + 1, 0)
  }

  /**
   * Template Chunk model
   * @type {Object}
   */
  const TemplateChunk = {
    // Static props
    // bindings: null,
    // bindingsData: null,
    // html: null,
    // isTemplateTag: false,
    // fragment: null,
    // children: null,
    // dom: null,
    // el: null,

    /**
     * Create the template DOM structure that will be cloned on each mount
     * @param   {HTMLElement} el - the root node
     * @returns {TemplateChunk} self
     */
    createDOM(el) {
      // make sure that the DOM gets created before cloning the template
      this.dom =
        this.dom ||
        createTemplateDOM(el, this.html) ||
        document.createDocumentFragment();

      return this
    },

    // API methods
    /**
     * Attach the template to a DOM node
     * @param   {HTMLElement} el - target DOM node
     * @param   {*} scope - template data
     * @param   {*} parentScope - scope of the parent template tag
     * @param   {Object} meta - meta properties needed to handle the <template> tags in loops
     * @returns {TemplateChunk} self
     */
    mount(el, scope, parentScope, meta = {}) {
      if (!el) panic('Please provide DOM node to mount properly your template');

      if (this.el) this.unmount(scope);

      // <template> tags require a bit more work
      // the template fragment might be already created via meta outside of this call
      const { fragment, children, avoidDOMInjection } = meta;
      // <template> bindings of course can not have a root element
      // so we check the parent node to set the query selector bindings
      const { parentNode } = children ? children[0] : el;
      const isTemplateTag = isTemplate(el);
      const templateTagOffset = isTemplateTag
        ? getTemplateTagOffset(parentNode, el, meta)
        : null;

      // create the DOM if it wasn't created before
      this.createDOM(el);

      // create the DOM of this template cloning the original DOM structure stored in this instance
      // notice that if a documentFragment was passed (via meta) we will use it instead
      const cloneNode = fragment || this.dom.cloneNode(true);

      // store root node
      // notice that for template tags the root note will be the parent tag
      this.el = isTemplateTag ? parentNode : el;

      // create the children array only for the <template> fragments
      this.children = isTemplateTag
        ? children || Array.from(cloneNode.childNodes)
        : null;

      // inject the DOM into the el only if a fragment is available
      if (!avoidDOMInjection && cloneNode) injectDOM(el, cloneNode);

      // create the bindings
      this.bindings = this.bindingsData.map((binding) =>
        create$1(this.el, binding, templateTagOffset),
      );
      this.bindings.forEach((b) => b.mount(scope, parentScope));

      // store the template meta properties
      this.meta = meta;

      return this
    },

    /**
     * Update the template with fresh data
     * @param   {*} scope - template data
     * @param   {*} parentScope - scope of the parent template tag
     * @returns {TemplateChunk} self
     */
    update(scope, parentScope) {
      this.bindings.forEach((b) => b.update(scope, parentScope));

      return this
    },

    /**
     * Remove the template from the node where it was initially mounted
     * @param   {*} scope - template data
     * @param   {*} parentScope - scope of the parent template tag
     * @param   {boolean|null} mustRemoveRoot - if true remove the root element,
     * if false or undefined clean the root tag content, if null don't touch the DOM
     * @returns {TemplateChunk} self
     */
    unmount(scope, parentScope, mustRemoveRoot = false) {
      const el = this.el;

      if (!el) {
        return this
      }

      this.bindings.forEach((b) => b.unmount(scope, parentScope, mustRemoveRoot));

      switch (true) {
        // pure components should handle the DOM unmount updates by themselves
        // for mustRemoveRoot === null don't touch the DOM
        case el[IS_PURE_SYMBOL] || mustRemoveRoot === null:
          break

        // if children are declared, clear them
        // applicable for <template> and <slot/> bindings
        case Array.isArray(this.children):
          clearChildren(this.children);
          break

        // clean the node children only
        case !mustRemoveRoot:
          cleanNode(el);
          break

        // remove the root node only if the mustRemoveRoot is truly
        case !!mustRemoveRoot:
          removeChild(el);
          break
      }

      this.el = null;

      return this
    },

    /**
     * Clone the template chunk
     * @returns {TemplateChunk} a clone of this object resetting the this.el property
     */
    clone() {
      return {
        ...this,
        meta: {},
        el: null,
      }
    },
  };

  /**
   * Create a template chunk wiring also the bindings
   * @param   {string|HTMLElement} html - template string
   * @param   {BindingData[]} bindings - bindings collection
   * @returns {TemplateChunk} a new TemplateChunk copy
   */
  function create(html, bindings = []) {
    return {
      ...TemplateChunk,
      html,
      bindingsData: bindings,
    }
  }

  /**
   * Factory function to create the component templates only once
   * @param   {Function} template - component template creation function
   * @param   {RiotComponentWrapper} componentWrapper - riot compiler generated object
   * @param   {Function} getChildComponent - getter function to return the children components
   * @returns {TemplateChunk} template chunk object
   */
  function componentTemplateFactory(
    template,
    componentWrapper,
    getChildComponent,
  ) {
    return template(
      create,
      expressionTypes,
      bindingTypes,
      getChildComponent,
    )
  }

  const PURE_COMPONENT_API = Object.freeze({
    [MOUNT_METHOD_KEY]: noop,
    [UPDATE_METHOD_KEY]: noop,
    [UNMOUNT_METHOD_KEY]: noop,
  });

  /**
   * Bind a DOM node to its component object
   * @param   {HTMLElement} node - html node mounted
   * @param   {Object} component - Riot.js component object
   * @returns {Object} the component object received as second argument
   */
  const bindDOMNodeToComponentInstance = (node, component) =>
    (node[DOM_COMPONENT_INSTANCE_PROPERTY] = component);

  /**
   * Wrap the Riot.js core API methods using a mapping function
   * @param   {Function} mapFunction - lifting function
   * @returns {Object} an object having the { mount, update, unmount } functions
   */
  function createCoreAPIMethods(mapFunction) {
    return [MOUNT_METHOD_KEY, UPDATE_METHOD_KEY, UNMOUNT_METHOD_KEY].reduce(
      (acc, method) => {
        acc[method] = mapFunction(method);

        return acc
      },
      {},
    )
  }

  /**
   * Create a pure component
   * @param   {Function} pureFactoryFunction - pure component factory function
   * @param   {Array} options.slots - component slots
   * @param   {Array} options.attributes - component attributes
   * @param   {Array} options.template - template factory function
   * @param   {Array} options.template - template factory function
   * @param   {any} options.props - initial component properties
   * @returns {Object} pure component object
   */
  function createPureComponent(
    pureFactoryFunction,
    { slots, attributes, props, css, template },
  ) {
    if (template) panic('Pure components can not have html');
    if (css) panic('Pure components do not have css');

    const component = defineDefaults(
      pureFactoryFunction({ slots, attributes, props }),
      PURE_COMPONENT_API,
    );

    return createCoreAPIMethods((method) => (...args) => {
      // intercept the mount calls to bind the DOM node to the pure object created
      // see also https://github.com/riot/riot/issues/2806
      if (method === MOUNT_METHOD_KEY) {
        const [element] = args;
        // mark this node as pure element
        defineProperty(element, IS_PURE_SYMBOL, true);
        bindDOMNodeToComponentInstance(element, component);
      }

      component[method](...args);

      return component
    })
  }

  /**
   * Converts any DOM node/s to a loopable array
   * @param   { HTMLElement|NodeList } els - single html element or a node list
   * @returns { Array } always a loopable object
   */
  function domToArray(els) {
    // can this object be already looped?
    if (!Array.isArray(els)) {
      // is it a node list?
      if (
        /^\[object (HTMLCollection|NodeList|Object)\]$/
          .test(Object.prototype.toString.call(els))
          && typeof els.length === 'number'
      )
        return Array.from(els)
      else
        // if it's a single node
        // it will be returned as "array" with one single entry
        return [els]
    }
    // this object could be looped out of the box
    return els
  }

  /**
   * Simple helper to find DOM nodes returning them as array like loopable object
   * @param   { string|DOMNodeList } selector - either the query or the DOM nodes to arraify
   * @param   { HTMLElement }        scope      - context defining where the query will search for the DOM nodes
   * @returns { Array } DOM nodes found as array
   */
  function $(selector, scope) {
    return domToArray(typeof selector === 'string' ?
      (scope || document).querySelectorAll(selector) :
      selector
    )
  }

  const COMPONENT_DOM_SELECTORS = Object.freeze({
    // component helpers
    $(selector) {
      return $(selector, this.root)[0]
    },
    $$(selector) {
      return $(selector, this.root)
    },
  });

  const COMPONENT_LIFECYCLE_METHODS = Object.freeze({
    [SHOULD_UPDATE_KEY]: noop,
    [ON_BEFORE_MOUNT_KEY]: noop,
    [ON_MOUNTED_KEY]: noop,
    [ON_BEFORE_UPDATE_KEY]: noop,
    [ON_UPDATED_KEY]: noop,
    [ON_BEFORE_UNMOUNT_KEY]: noop,
    [ON_UNMOUNTED_KEY]: noop,
  });

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
      return normalize(names.map(n => el[method](n)))
    }))
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
    const attrs = typeof name === 'object' ? name : { [name]: value };
    const props = Object.keys(attrs);

    domToArray(els).forEach(el => {
      props.forEach(prop => el.setAttribute(prop, attrs[prop]));
    });
    return els
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
    return parseNodes(els, name, 'getAttribute')
  }

  const CSS_BY_NAME = new Map();
  const STYLE_NODE_SELECTOR = 'style[riot]';

  // memoized curried function
  const getStyleNode = ((style) => {
    return () => {
      // lazy evaluation:
      // if this function was already called before
      // we return its cached result
      if (style) return style

      // create a new style element or use an existing one
      // and cache it internally
      style = $(STYLE_NODE_SELECTOR)[0] || document.createElement('style');
      set(style, 'type', 'text/css');

      /* istanbul ignore next */
      if (!style.parentNode) document.head.appendChild(style);

      return style
    }
  })();

  /**
   * Object that will be used to inject and manage the css of every tag instance
   */
  const cssManager = {
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
        this.inject();
      }

      return this
    },
    /**
     * Inject all previously saved tag styles into DOM
     * innerHTML seems slow: http://jsperf.com/riot-insert-style
     * @returns {Object} self
     */
    inject() {
      getStyleNode().innerHTML = [...CSS_BY_NAME.values()].join('\n');
      return this
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

      return this
    },
  };

  /**
   * Function to curry any javascript method
   * @param   {Function}  fn - the target function we want to curry
   * @param   {...[args]} acc - initial arguments
   * @returns {Function|*} it will return a function until the target function
   *                       will receive all of its arguments
   */
  function curry(fn, ...acc) {
    return (...args) => {
      args = [...acc, ...args];

      return args.length < fn.length ?
        curry(fn, ...args) :
        fn(...args)
    }
  }

  /**
   * Get the tag name of any DOM node
   * @param   {HTMLElement} element - DOM node we want to inspect
   * @returns {string} name to identify this dom node in riot
   */
  function getName(element) {
    return get(element, IS_DIRECTIVE) || element.tagName.toLowerCase()
  }

  /**
   * Add eventually the "is" attribute to link this DOM node to its css
   * @param {HTMLElement} element - target root node
   * @param {string} name - name of the component mounted
   * @returns {undefined} it's a void function
   */

  function addCssHook(element, name) {
    if (getName(element) !== name) {
      set(element, IS_DIRECTIVE, name);
    }
  }

  /**
   * Compute the component current state merging it with its previous state
   * @param   {Object} oldState - previous state object
   * @param   {Object} newState - new state given to the `update` call
   * @returns {Object} new object state
   */
  function computeComponentState(oldState, newState) {
    return {
      ...oldState,
      ...callOrAssign(newState),
    }
  }

  /**
   * Evaluate the component properties either from its real attributes or from its initial user properties
   * @param   {HTMLElement} element - component root
   * @param   {Object}  initialProps - initial props
   * @returns {Object} component props key value pairs
   */
  function computeInitialProps(element, initialProps = {}) {
    return {
      ...DOMattributesToObject(element),
      ...callOrAssign(initialProps),
    }
  }

  /**
   * Create the bindings to update the component attributes
   * @param   {HTMLElement} node - node where we will bind the expressions
   * @param   {Array} attributes - list of attribute bindings
   * @returns {TemplateChunk} - template bindings object
   */
  function createAttributeBindings(node, attributes = []) {
    const expressions = attributes.map((a) => create$4(node, a));
    const binding = {};

    return Object.assign(binding, {
      expressions,
      ...createCoreAPIMethods((method) => (scope) => {
        expressions.forEach((e) => e[method](scope));

        return binding
      }),
    })
  }

  /**
   * Run the component instance through all the plugins set by the user
   * @param   {Object} component - component instance
   * @returns {Object} the component enhanced by the plugins
   */
  function runPlugins(component) {
    return [...PLUGINS_SET].reduce((c, fn) => fn(c) || c, component)
  }

  /**
   * Component creation factory function that will enhance the user provided API
   * @param   {Object} component - a component implementation previously defined
   * @param   {Array} options.slots - component slots generated via riot compiler
   * @param   {Array} options.attributes - attribute expressions generated via riot compiler
   * @returns {Riot.Component} a riot component instance
   */
  function manageComponentLifecycle(
    component,
    { slots, attributes, props },
  ) {
    return autobindMethods(
      runPlugins(
        defineProperties(
          isObject(component) ? Object.create(component) : component,
          {
            mount(element, state = {}, parentScope) {
              // any element mounted passing through this function can't be a pure component
              defineProperty(element, IS_PURE_SYMBOL, false);
              this[PARENT_KEY_SYMBOL] = parentScope;
              this[ATTRIBUTES_KEY_SYMBOL] = createAttributeBindings(
                element,
                attributes,
              ).mount(parentScope);

              defineProperty(
                this,
                PROPS_KEY,
                Object.freeze({
                  ...computeInitialProps(element, props),
                  ...evaluateAttributeExpressions(
                    this[ATTRIBUTES_KEY_SYMBOL].expressions,
                  ),
                }),
              );

              this[STATE_KEY] = computeComponentState(this[STATE_KEY], state);
              this[TEMPLATE_KEY_SYMBOL] = this.template.createDOM(element).clone();

              // link this object to the DOM node
              bindDOMNodeToComponentInstance(element, this);
              // add eventually the 'is' attribute
              component.name && addCssHook(element, component.name);

              // define the root element
              defineProperty(this, ROOT_KEY, element);
              // define the slots array
              defineProperty(this, SLOTS_KEY, slots);

              // before mount lifecycle event
              this[ON_BEFORE_MOUNT_KEY](this[PROPS_KEY], this[STATE_KEY]);
              // mount the template
              this[TEMPLATE_KEY_SYMBOL].mount(element, this, parentScope);
              this[ON_MOUNTED_KEY](this[PROPS_KEY], this[STATE_KEY]);

              return this
            },
            update(state = {}, parentScope) {
              if (parentScope) {
                this[PARENT_KEY_SYMBOL] = parentScope;
                this[ATTRIBUTES_KEY_SYMBOL].update(parentScope);
              }

              // Avoid adding the riot "is" directives to the component props
              // eslint-disable-next-line no-unused-vars
              const { [IS_DIRECTIVE]: _, ...newProps } = {
                // make sure that the root node attributes will be always parsed
                ...DOMattributesToObject(this[ROOT_KEY]),
                ...evaluateAttributeExpressions(
                  this[ATTRIBUTES_KEY_SYMBOL].expressions,
                ),
              };

              if (this[SHOULD_UPDATE_KEY](newProps, this[PROPS_KEY]) === false)
                return

              defineProperty(
                this,
                PROPS_KEY,
                Object.freeze({
                  // only root components will merge their initial props with the new ones
                  // children components will just get them overridden see also https://github.com/riot/riot/issues/2978
                  ...(parentScope ? null : this[PROPS_KEY]),
                  ...newProps,
                }),
              );

              this[STATE_KEY] = computeComponentState(this[STATE_KEY], state);

              this[ON_BEFORE_UPDATE_KEY](this[PROPS_KEY], this[STATE_KEY]);

              // avoiding recursive updates
              // see also https://github.com/riot/riot/issues/2895
              if (!this[IS_COMPONENT_UPDATING]) {
                this[IS_COMPONENT_UPDATING] = true;
                this[TEMPLATE_KEY_SYMBOL].update(this, this[PARENT_KEY_SYMBOL]);
              }

              this[ON_UPDATED_KEY](this[PROPS_KEY], this[STATE_KEY]);
              this[IS_COMPONENT_UPDATING] = false;

              return this
            },
            unmount(preserveRoot) {
              this[ON_BEFORE_UNMOUNT_KEY](this[PROPS_KEY], this[STATE_KEY]);
              this[ATTRIBUTES_KEY_SYMBOL].unmount();
              // if the preserveRoot is null the template html will be left untouched
              // in that case the DOM cleanup will happen differently from a parent node
              this[TEMPLATE_KEY_SYMBOL].unmount(
                this,
                this[PARENT_KEY_SYMBOL],
                preserveRoot === null ? null : !preserveRoot,
              );
              this[ON_UNMOUNTED_KEY](this[PROPS_KEY], this[STATE_KEY]);

              return this
            },
          },
        ),
      ),
      Object.keys(component).filter((prop) => isFunction(component[prop])),
    )
  }

  /**
   * Component definition function
   * @param   {Object} implementation - the component implementation will be generated via compiler
   * @param   {Object} component - the component initial properties
   * @returns {Object} a new component implementation object
   */
  function instantiateComponent({ css, template, componentAPI, name }) {
    // add the component css into the DOM
    if (css && name) cssManager.add(name, css);

    return curry(manageComponentLifecycle)(
      defineProperties(
        // set the component defaults without overriding the original component API
        defineDefaults(componentAPI, {
          ...COMPONENT_LIFECYCLE_METHODS,
          [PROPS_KEY]: {},
          [STATE_KEY]: {},
        }),
        {
          // defined during the component creation
          [SLOTS_KEY]: null,
          [ROOT_KEY]: null,
          // these properties should not be overriden
          ...COMPONENT_DOM_SELECTORS,
          name,
          css,
          template,
        },
      ),
    )
  }

  /**
   * Create the subcomponents that can be included inside a tag in runtime
   * @param   {Object} components - components imported in runtime
   * @returns {Object} all the components transformed into Riot.Component factory functions
   */
  function createChildrenComponentsObject(components = {}) {
    return Object.entries(callOrAssign(components)).reduce(
      (acc, [key, value]) => {
        acc[camelToDashCase(key)] = createComponentFromWrapper(value);
        return acc
      },
      {},
    )
  }

  /**
   * Create the getter function to render the child components
   * @param   {RiotComponentWrapper} componentWrapper - riot compiler generated object
   * @returns {Function} function returning the component factory function
   */
  const createChildComponentGetter = (componentWrapper) => {
    const childrenComponents = createChildrenComponentsObject(
      componentWrapper.exports ? componentWrapper.exports.components : {},
    );

    return (name) => {
      // improve support for recursive components
      if (name === componentWrapper.name)
        return memoizedCreateComponentFromWrapper(componentWrapper)
      // return the registered components
      return childrenComponents[name] || COMPONENTS_IMPLEMENTATION_MAP.get(name)
    }
  };

  /**
   * Performance optimization for the recursive components
   * @param  {RiotComponentWrapper} componentWrapper - riot compiler generated object
   * @returns {Object} component like interface
   */
  const memoizedCreateComponentFromWrapper = memoize(createComponentFromWrapper);

  /**
   * Create the component interface needed for the @riotjs/dom-bindings tag bindings
   * @param   {RiotComponentWrapper} componentWrapper - riot compiler generated object
   * @param   {string} componentWrapper.css - component css
   * @param   {Function} componentWrapper.template - function that will return the dom-bindings template function
   * @param   {Object} componentWrapper.exports - component interface
   * @param   {string} componentWrapper.name - component name
   * @returns {Object} component like interface
   */
  function createComponentFromWrapper(componentWrapper) {
    const { css, template, exports, name } = componentWrapper;
    const templateFn = template
      ? componentTemplateFactory(
          template,
          componentWrapper,
          createChildComponentGetter(componentWrapper),
        )
      : MOCKED_TEMPLATE_INTERFACE;

    return ({ slots, attributes, props }) => {
      // pure components rendering will be managed by the end user
      if (exports && exports[IS_PURE_SYMBOL])
        return createPureComponent(exports, {
          slots,
          attributes,
          props,
          css,
          template,
        })

      const componentAPI = callOrAssign(exports) || {};

      const component = instantiateComponent({
        css,
        template: templateFn,
        componentAPI,
        name,
      })({ slots, attributes, props });

      // notice that for the components created via tag binding
      // we need to invert the mount (state/parentScope) arguments
      // the template bindings will only forward the parentScope updates
      // and never deal with the component state
      return {
        mount(element, parentScope, state) {
          return component.mount(element, state, parentScope)
        },
        update(parentScope, state) {
          return component.update(state, parentScope)
        },
        unmount(preserveRoot) {
          return component.unmount(preserveRoot)
        },
      }
    }
  }

  /**
   * Register a custom tag by name
   * @param   {string} name - component name
   * @param   {Object} implementation - tag implementation
   * @returns {Map} map containing all the components implementations
   */
  function register(name, { css, template, exports }) {
    if (COMPONENTS_IMPLEMENTATION_MAP.has(name))
      panic(`The component "${name}" was already registered`);

    COMPONENTS_IMPLEMENTATION_MAP.set(
      name,
      createComponentFromWrapper({ name, css, template, exports }),
    );

    return COMPONENTS_IMPLEMENTATION_MAP
  }

  /**
   * Unregister a riot web component
   * @param   {string} name - component name
   * @returns {Map} map containing all the components implementations
   */
  function unregister(name) {
    if (!COMPONENTS_IMPLEMENTATION_MAP.has(name))
      panic(`The component "${name}" was never registered`);

    COMPONENTS_IMPLEMENTATION_MAP.delete(name);
    cssManager.remove(name);

    return COMPONENTS_IMPLEMENTATION_MAP
  }

  /**
   * Component initialization function starting from a DOM node
   * @param   {HTMLElement} element - element to upgrade
   * @param   {Object} initialProps - initial component properties
   * @param   {string} componentName - component id
   * @param   {Array} slots - component slots
   * @returns {Object} a new component instance bound to a DOM node
   */
  function mountComponent(element, initialProps, componentName, slots) {
    const name = componentName || getName(element);
    if (!COMPONENTS_IMPLEMENTATION_MAP.has(name))
      panic(`The component named "${name}" was never registered`);

    const component = COMPONENTS_IMPLEMENTATION_MAP.get(name)({
      props: initialProps,
      slots,
    });

    return component.mount(element)
  }

  /**
   * Mounting function that will work only for the components that were globally registered
   * @param   {string|HTMLElement} selector - query for the selection or a DOM element
   * @param   {Object} initialProps - the initial component properties
   * @param   {string} name - optional component name
   * @returns {Array} list of riot components
   */
  function mount(selector, initialProps, name) {
    return $(selector).map((element) =>
      mountComponent(element, initialProps, name),
    )
  }

  /**
   * Sweet unmounting helper function for the DOM node mounted manually by the user
   * @param   {string|HTMLElement} selector - query for the selection or a DOM element
   * @param   {boolean|null} keepRootElement - if true keep the root element
   * @returns {Array} list of nodes unmounted
   */
  function unmount(selector, keepRootElement) {
    return $(selector).map((element) => {
      if (element[DOM_COMPONENT_INSTANCE_PROPERTY]) {
        element[DOM_COMPONENT_INSTANCE_PROPERTY].unmount(keepRootElement);
      }
      return element
    })
  }

  /**
   * Define a riot plugin
   * @param   {Function} plugin - function that will receive all the components created
   * @returns {Set} the set containing all the plugins installed
   */
  function install(plugin) {
    if (!isFunction(plugin)) panic('Plugins must be of type function');
    if (PLUGINS_SET.has(plugin)) panic('This plugin was already installed');

    PLUGINS_SET.add(plugin);

    return PLUGINS_SET
  }

  /**
   * Uninstall a riot plugin
   * @param   {Function} plugin - plugin previously installed
   * @returns {Set} the set containing all the plugins installed
   */
  function uninstall(plugin) {
    if (!PLUGINS_SET.has(plugin)) panic('This plugin was never installed');

    PLUGINS_SET.delete(plugin);

    return PLUGINS_SET
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
  function compose(...fns) {
    return fns.reduce((f, g) => (...args) => f(g(...args)))
  }

  /**
   * Helper method to create component without relying on the registered ones
   * @param   {Object} implementation - component implementation
   * @returns {Function} function that will allow you to mount a riot component on a DOM node
   */
  function component(implementation) {
    return (el, props, { slots, attributes, parentScope } = {}) =>
      compose(
        (c) => c.mount(el, parentScope),
        (c) => c({ props, slots, attributes }),
        createComponentFromWrapper,
      )(implementation)
  }

  /**
   * Lift a riot component Interface into a pure riot object
   * @param   {Function} func - RiotPureComponent factory function
   * @returns {Function} the lifted original function received as argument
   */
  function pure(func) {
    if (!isFunction(func))
      panic('riot.pure accepts only arguments of type "function"');
    func[IS_PURE_SYMBOL] = true;
    return func
  }

  /**
   * no-op function needed to add the proper types to your component via typescript
   * @param {Function|Object} component - component default export
   * @returns {Function|Object} returns exactly what it has received
   */
  /* istanbul ignore next */
  const withTypes = (component) => component;

  /** @type {string} current riot version */
  const version = 'v9.1.1';

  // expose some internal stuff that might be used from external tools
  const __ = {
    cssManager,
    DOMBindings: {
      template: create,
      createBinding: create$1,
      createExpression: create$4,
      bindingTypes,
      expressionTypes,
    },
    globals: {
      DOM_COMPONENT_INSTANCE_PROPERTY,
      PARENT_KEY_SYMBOL,
    },
  };

  exports.__ = __;
  exports.component = component;
  exports.install = install;
  exports.mount = mount;
  exports.pure = pure;
  exports.register = register;
  exports.uninstall = uninstall;
  exports.unmount = unmount;
  exports.unregister = unregister;
  exports.version = version;
  exports.withTypes = withTypes;

}));
