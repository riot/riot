/* Riot v4.0.0-alpha.4, @license MIT */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.riot = {}));
}(this, function (exports) { 'use strict';

  var cov_196y82dr77 = function () {
    var path = "/Users/gianlucaguarini/Sites/riot/riot/src/globals.js";
    var hash = "f5ee5e936a3ca292e9df4e23cad946aaf2b80c69";

    var Function = function () {}.constructor;

    var global = new Function("return this")();
    var gcv = "__coverage__";
    var coverageData = {
      path: "/Users/gianlucaguarini/Sites/riot/riot/src/globals.js",
      statementMap: {
        "0": {
          start: {
            line: 2,
            column: 34
          },
          end: {
            line: 2,
            column: 43
          }
        },
        "1": {
          start: {
            line: 3,
            column: 36
          },
          end: {
            line: 3,
            column: 60
          }
        },
        "2": {
          start: {
            line: 4,
            column: 16
          },
          end: {
            line: 4,
            column: 25
          }
        },
        "3": {
          start: {
            line: 5,
            column: 17
          },
          end: {
            line: 5,
            column: 21
          }
        }
      },
      fnMap: {},
      branchMap: {},
      s: {
        "0": 0,
        "1": 0,
        "2": 0,
        "3": 0
      },
      f: {},
      b: {},
      _coverageSchema: "43e27e138ebf9cfc5966b082cf9a028302ed4184"
    };
    var coverage = global[gcv] || (global[gcv] = {});

    if (coverage[path] && coverage[path].hash === hash) {
      return coverage[path];
    }

    coverageData.hash = hash;
    return coverage[path] = coverageData;
  }();

  var COMPONENTS_IMPLEMENTATION_MAP = (cov_196y82dr77.s[0]++, new Map()),
      DOM_COMPONENT_INSTANCE_PROPERTY = (cov_196y82dr77.s[1]++, Symbol('riot-component')),
      PLUGINS_SET = (cov_196y82dr77.s[2]++, new Set()),
      IS_DIRECTIVE = (cov_196y82dr77.s[3]++, 'is');

  var globals = /*#__PURE__*/Object.freeze({
    COMPONENTS_IMPLEMENTATION_MAP: COMPONENTS_IMPLEMENTATION_MAP,
    DOM_COMPONENT_INSTANCE_PROPERTY: DOM_COMPONENT_INSTANCE_PROPERTY,
    PLUGINS_SET: PLUGINS_SET,
    IS_DIRECTIVE: IS_DIRECTIVE
  });

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      var ownKeys = Object.keys(source);

      if (typeof Object.getOwnPropertySymbols === 'function') {
        ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable;
        }));
      }

      ownKeys.forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    }

    return target;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    }
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _iterableToArrayLimit(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }

  var cov_zf186sduu = function () {
    var path = "/Users/gianlucaguarini/Sites/riot/riot/src/utils/checks.js";
    var hash = "73613a47fbc06bbe225be36abcfbc5d935f77856";

    var Function = function () {}.constructor;

    var global = new Function("return this")();
    var gcv = "__coverage__";
    var coverageData = {
      path: "/Users/gianlucaguarini/Sites/riot/riot/src/utils/checks.js",
      statementMap: {
        "0": {
          start: {
            line: 8,
            column: 2
          },
          end: {
            line: 8,
            column: 32
          }
        },
        "1": {
          start: {
            line: 17,
            column: 2
          },
          end: {
            line: 17,
            column: 37
          }
        },
        "2": {
          start: {
            line: 26,
            column: 2
          },
          end: {
            line: 26,
            column: 35
          }
        }
      },
      fnMap: {
        "0": {
          name: "checkType",
          decl: {
            start: {
              line: 7,
              column: 16
            },
            end: {
              line: 7,
              column: 25
            }
          },
          loc: {
            start: {
              line: 7,
              column: 41
            },
            end: {
              line: 9,
              column: 1
            }
          },
          line: 7
        },
        "1": {
          name: "isFunction",
          decl: {
            start: {
              line: 16,
              column: 16
            },
            end: {
              line: 16,
              column: 26
            }
          },
          loc: {
            start: {
              line: 16,
              column: 34
            },
            end: {
              line: 18,
              column: 1
            }
          },
          line: 16
        },
        "2": {
          name: "isString",
          decl: {
            start: {
              line: 25,
              column: 16
            },
            end: {
              line: 25,
              column: 24
            }
          },
          loc: {
            start: {
              line: 25,
              column: 32
            },
            end: {
              line: 27,
              column: 1
            }
          },
          line: 25
        }
      },
      branchMap: {},
      s: {
        "0": 0,
        "1": 0,
        "2": 0
      },
      f: {
        "0": 0,
        "1": 0,
        "2": 0
      },
      b: {},
      _coverageSchema: "43e27e138ebf9cfc5966b082cf9a028302ed4184"
    };
    var coverage = global[gcv] || (global[gcv] = {});

    if (coverage[path] && coverage[path].hash === hash) {
      return coverage[path];
    }

    coverageData.hash = hash;
    return coverage[path] = coverageData;
  }();

  /**
   * Quick type checking
   * @param   {*} element - anything
   * @param   {string} type - type definition
   * @returns {boolean} true if the type corresponds
   */
  function checkType(element, type) {
    cov_zf186sduu.f[0]++;
    cov_zf186sduu.s[0]++;
    return _typeof(element) === type;
  }
  /**
   * Check that will be passed if its argument is a function
   * @param   {*} value - value to check
   * @returns {boolean} - true if the value is a function
   */

  function isFunction(value) {
    cov_zf186sduu.f[1]++;
    cov_zf186sduu.s[1]++;
    return checkType(value, 'function');
  }
  /**
   * Check that will be passed if its argument is a string
   * @param   {*} value - value to check
   * @returns {boolean} - true if the value is a string
   */

  function isString(value) {
    cov_zf186sduu.f[2]++;
    cov_zf186sduu.s[2]++;
    return checkType(value, 'string');
  }

  var cov_h9kep7qkr = function () {
    var path = "/Users/gianlucaguarini/Sites/riot/riot/src/utils/dom.js";
    var hash = "e78ae632e49e41083e70c3dc4cd842cec16e04f8";

    var Function = function () {}.constructor;

    var global = new Function("return this")();
    var gcv = "__coverage__";
    var coverageData = {
      path: "/Users/gianlucaguarini/Sites/riot/riot/src/utils/dom.js",
      statementMap: {
        "0": {
          start: {
            line: 11,
            column: 2
          },
          end: {
            line: 11,
            column: 93
          }
        },
        "1": {
          start: {
            line: 11,
            column: 26
          },
          end: {
            line: 11,
            column: 93
          }
        },
        "2": {
          start: {
            line: 12,
            column: 2
          },
          end: {
            line: 12,
            column: 29
          }
        },
        "3": {
          start: {
            line: 22,
            column: 2
          },
          end: {
            line: 22,
            column: 78
          }
        },
        "4": {
          start: {
            line: 22,
            column: 26
          },
          end: {
            line: 22,
            column: 78
          }
        },
        "5": {
          start: {
            line: 23,
            column: 2
          },
          end: {
            line: 23,
            column: 17
          }
        },
        "6": {
          start: {
            line: 31,
            column: 2
          },
          end: {
            line: 31,
            column: 86
          }
        },
        "7": {
          start: {
            line: 41,
            column: 2
          },
          end: {
            line: 53,
            column: 3
          }
        },
        "8": {
          start: {
            line: 43,
            column: 4
          },
          end: {
            line: 52,
            column: 18
          }
        },
        "9": {
          start: {
            line: 48,
            column: 6
          },
          end: {
            line: 48,
            column: 28
          }
        },
        "10": {
          start: {
            line: 52,
            column: 6
          },
          end: {
            line: 52,
            column: 18
          }
        },
        "11": {
          start: {
            line: 55,
            column: 2
          },
          end: {
            line: 55,
            column: 12
          }
        },
        "12": {
          start: {
            line: 65,
            column: 2
          },
          end: {
            line: 65,
            column: 35
          }
        },
        "13": {
          start: {
            line: 76,
            column: 2
          },
          end: {
            line: 78,
            column: 3
          }
        },
        "14": {
          start: {
            line: 77,
            column: 4
          },
          end: {
            line: 77,
            column: 37
          }
        },
        "15": {
          start: {
            line: 87,
            column: 2
          },
          end: {
            line: 90,
            column: 8
          }
        },
        "16": {
          start: {
            line: 88,
            column: 4
          },
          end: {
            line: 88,
            column: 41
          }
        },
        "17": {
          start: {
            line: 89,
            column: 4
          },
          end: {
            line: 89,
            column: 14
          }
        },
        "18": {
          start: {
            line: 99,
            column: 2
          },
          end: {
            line: 99,
            column: 77
          }
        }
      },
      fnMap: {
        "0": {
          name: "$$",
          decl: {
            start: {
              line: 10,
              column: 16
            },
            end: {
              line: 10,
              column: 18
            }
          },
          loc: {
            start: {
              line: 10,
              column: 38
            },
            end: {
              line: 13,
              column: 1
            }
          },
          line: 10
        },
        "1": {
          name: "$",
          decl: {
            start: {
              line: 21,
              column: 16
            },
            end: {
              line: 21,
              column: 17
            }
          },
          loc: {
            start: {
              line: 21,
              column: 37
            },
            end: {
              line: 24,
              column: 1
            }
          },
          line: 21
        },
        "2": {
          name: "getWindow",
          decl: {
            start: {
              line: 30,
              column: 16
            },
            end: {
              line: 30,
              column: 25
            }
          },
          loc: {
            start: {
              line: 30,
              column: 28
            },
            end: {
              line: 32,
              column: 1
            }
          },
          line: 30
        },
        "3": {
          name: "domToArray",
          decl: {
            start: {
              line: 39,
              column: 24
            },
            end: {
              line: 39,
              column: 34
            }
          },
          loc: {
            start: {
              line: 39,
              column: 40
            },
            end: {
              line: 56,
              column: 1
            }
          },
          line: 39
        },
        "4": {
          name: "getAttribute",
          decl: {
            start: {
              line: 64,
              column: 16
            },
            end: {
              line: 64,
              column: 28
            }
          },
          loc: {
            start: {
              line: 64,
              column: 44
            },
            end: {
              line: 66,
              column: 1
            }
          },
          line: 64
        },
        "5": {
          name: "setAttribute",
          decl: {
            start: {
              line: 75,
              column: 16
            },
            end: {
              line: 75,
              column: 28
            }
          },
          loc: {
            start: {
              line: 75,
              column: 51
            },
            end: {
              line: 79,
              column: 1
            }
          },
          line: 75
        },
        "6": {
          name: "getAttributes",
          decl: {
            start: {
              line: 86,
              column: 16
            },
            end: {
              line: 86,
              column: 29
            }
          },
          loc: {
            start: {
              line: 86,
              column: 39
            },
            end: {
              line: 91,
              column: 1
            }
          },
          line: 86
        },
        "7": {
          name: "(anonymous_7)",
          decl: {
            start: {
              line: 87,
              column: 47
            },
            end: {
              line: 87,
              column: 48
            }
          },
          loc: {
            start: {
              line: 87,
              column: 67
            },
            end: {
              line: 90,
              column: 3
            }
          },
          line: 87
        },
        "8": {
          name: "getName",
          decl: {
            start: {
              line: 98,
              column: 16
            },
            end: {
              line: 98,
              column: 23
            }
          },
          loc: {
            start: {
              line: 98,
              column: 33
            },
            end: {
              line: 100,
              column: 1
            }
          },
          line: 98
        }
      },
      branchMap: {
        "0": {
          loc: {
            start: {
              line: 11,
              column: 2
            },
            end: {
              line: 11,
              column: 93
            }
          },
          type: "if",
          locations: [{
            start: {
              line: 11,
              column: 2
            },
            end: {
              line: 11,
              column: 93
            }
          }, {
            start: {
              line: 11,
              column: 2
            },
            end: {
              line: 11,
              column: 93
            }
          }],
          line: 11
        },
        "1": {
          loc: {
            start: {
              line: 11,
              column: 45
            },
            end: {
              line: 11,
              column: 64
            }
          },
          type: "binary-expr",
          locations: [{
            start: {
              line: 11,
              column: 45
            },
            end: {
              line: 11,
              column: 52
            }
          }, {
            start: {
              line: 11,
              column: 56
            },
            end: {
              line: 11,
              column: 64
            }
          }],
          line: 11
        },
        "2": {
          loc: {
            start: {
              line: 22,
              column: 2
            },
            end: {
              line: 22,
              column: 78
            }
          },
          type: "if",
          locations: [{
            start: {
              line: 22,
              column: 2
            },
            end: {
              line: 22,
              column: 78
            }
          }, {
            start: {
              line: 22,
              column: 2
            },
            end: {
              line: 22,
              column: 78
            }
          }],
          line: 22
        },
        "3": {
          loc: {
            start: {
              line: 22,
              column: 34
            },
            end: {
              line: 22,
              column: 53
            }
          },
          type: "binary-expr",
          locations: [{
            start: {
              line: 22,
              column: 34
            },
            end: {
              line: 22,
              column: 41
            }
          }, {
            start: {
              line: 22,
              column: 45
            },
            end: {
              line: 22,
              column: 53
            }
          }],
          line: 22
        },
        "4": {
          loc: {
            start: {
              line: 31,
              column: 9
            },
            end: {
              line: 31,
              column: 86
            }
          },
          type: "cond-expr",
          locations: [{
            start: {
              line: 31,
              column: 80
            },
            end: {
              line: 31,
              column: 86
            }
          }],
          line: 31
        },
        "5": {
          loc: {
            start: {
              line: 41,
              column: 2
            },
            end: {
              line: 53,
              column: 3
            }
          },
          type: "if",
          locations: [{
            start: {
              line: 41,
              column: 2
            },
            end: {
              line: 53,
              column: 3
            }
          }, {
            start: {
              line: 41,
              column: 2
            },
            end: {
              line: 53,
              column: 3
            }
          }],
          line: 41
        },
        "6": {
          loc: {
            start: {
              line: 43,
              column: 4
            },
            end: {
              line: 52,
              column: 18
            }
          },
          type: "if",
          locations: [{
            start: {
              line: 43,
              column: 4
            },
            end: {
              line: 52,
              column: 18
            }
          }, {
            start: {
              line: 43,
              column: 4
            },
            end: {
              line: 52,
              column: 18
            }
          }],
          line: 43
        },
        "7": {
          loc: {
            start: {
              line: 44,
              column: 6
            },
            end: {
              line: 46,
              column: 41
            }
          },
          type: "binary-expr",
          locations: [{
            start: {
              line: 44,
              column: 6
            },
            end: {
              line: 45,
              column: 50
            }
          }, {
            start: {
              line: 46,
              column: 11
            },
            end: {
              line: 46,
              column: 41
            }
          }],
          line: 44
        },
        "8": {
          loc: {
            start: {
              line: 76,
              column: 2
            },
            end: {
              line: 78,
              column: 3
            }
          },
          type: "if",
          locations: [{
            start: {
              line: 76,
              column: 2
            },
            end: {
              line: 78,
              column: 3
            }
          }, {
            start: {
              line: 76,
              column: 2
            },
            end: {
              line: 78,
              column: 3
            }
          }],
          line: 76
        },
        "9": {
          loc: {
            start: {
              line: 99,
              column: 9
            },
            end: {
              line: 99,
              column: 77
            }
          },
          type: "binary-expr",
          locations: [{
            start: {
              line: 99,
              column: 9
            },
            end: {
              line: 99,
              column: 44
            }
          }, {
            start: {
              line: 99,
              column: 48
            },
            end: {
              line: 99,
              column: 77
            }
          }],
          line: 99
        }
      },
      s: {
        "0": 0,
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0,
        "6": 0,
        "7": 0,
        "8": 0,
        "9": 0,
        "10": 0,
        "11": 0,
        "12": 0,
        "13": 0,
        "14": 0,
        "15": 0,
        "16": 0,
        "17": 0,
        "18": 0
      },
      f: {
        "0": 0,
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0,
        "6": 0,
        "7": 0,
        "8": 0
      },
      b: {
        "0": [0, 0],
        "1": [0, 0],
        "2": [0, 0],
        "3": [0, 0],
        "4": [0],
        "5": [0, 0],
        "6": [0, 0],
        "7": [0, 0],
        "8": [0, 0],
        "9": [0, 0]
      },
      _coverageSchema: "43e27e138ebf9cfc5966b082cf9a028302ed4184"
    };
    var coverage = global[gcv] || (global[gcv] = {});

    if (coverage[path] && coverage[path].hash === hash) {
      return coverage[path];
    }

    coverageData.hash = hash;
    return coverage[path] = coverageData;
  }();
  /**
   * Shorter and fast way to select multiple nodes in the DOM
   * @param   {string} selector - DOM selector
   * @param   {Object} context - DOM node where the targets of our search will is located
   * @returns {Array} dom nodes found
   */

  function $$(selector, context) {
    cov_h9kep7qkr.f[0]++;
    cov_h9kep7qkr.s[0]++;

    if (isString(selector)) {
      cov_h9kep7qkr.b[0][0]++;
      cov_h9kep7qkr.s[1]++;
      return Array.from(((cov_h9kep7qkr.b[1][0]++, context) || (cov_h9kep7qkr.b[1][1]++, document)).querySelectorAll(selector));
    } else {
      cov_h9kep7qkr.b[0][1]++;
    }

    cov_h9kep7qkr.s[2]++;
    return domToArray(selector);
  }
  /**
   * Select a single DOM element
   * @param   {string} selector - DOM selector
   * @param   {Object} context - DOM node where the targets of our search will is located
   * @returns {HTMLElement} DOM node found
   */

  function $(selector, context) {
    cov_h9kep7qkr.f[1]++;
    cov_h9kep7qkr.s[3]++;

    if (isString(selector)) {
      cov_h9kep7qkr.b[2][0]++;
      cov_h9kep7qkr.s[4]++;
      return ((cov_h9kep7qkr.b[3][0]++, context) || (cov_h9kep7qkr.b[3][1]++, document)).querySelector(selector);
    } else {
      cov_h9kep7qkr.b[2][1]++;
    }

    cov_h9kep7qkr.s[5]++;
    return selector;
  }
  /**
   * Get the document window
   * @returns {Object} window object
   */

  function getWindow() {
    cov_h9kep7qkr.f[2]++;
    cov_h9kep7qkr.s[6]++;
    return typeof window === 'undefined' ?
    /* istanbul ignore next */
    undefined : (cov_h9kep7qkr.b[4][0]++, window);
  }
  /**
   * Converts any DOM node/s to a loopable array
   * @param   { HTMLElement|NodeList } els - single html element or a node list
   * @returns { Array } always a loopable object
   */

  function domToArray(els) {
    cov_h9kep7qkr.f[3]++;
    cov_h9kep7qkr.s[7]++;

    // can this object be already looped?
    if (!Array.isArray(els)) {
      cov_h9kep7qkr.b[5][0]++;
      cov_h9kep7qkr.s[8]++;

      // is it a node list?
      if ((cov_h9kep7qkr.b[7][0]++, /^\[object (HTMLCollection|NodeList|Object)\]$/.test(Object.prototype.toString.call(els))) && (cov_h9kep7qkr.b[7][1]++, typeof els.length === 'number')) {
        cov_h9kep7qkr.b[6][0]++;
        cov_h9kep7qkr.s[9]++;
        return Array.from(els);
      } else // if it's a single node
        // it will be returned as "array" with one single entry
        {
          cov_h9kep7qkr.b[6][1]++;
          cov_h9kep7qkr.s[10]++;
          return [els];
        }
    } else {
      cov_h9kep7qkr.b[5][1]++;
    } // this object could be looped out of the box


    cov_h9kep7qkr.s[11]++;
    return els;
  }
  /**
   * Get the value of any DOM attribute on a node
   * @param   {HTMLElement} element - DOM node we want to inspect
   * @param   {string} name - name of the attribute we want to get
   * @returns {string|undefined} the node attribute if it exists
   */

  function getAttribute(element, name) {
    cov_h9kep7qkr.f[4]++;
    cov_h9kep7qkr.s[12]++;
    return element.getAttribute(name);
  }
  /**
   * Set the value of any DOM attribute
   * @param   {HTMLElement} element - DOM node we to update
   * @param   {string} name - name of the attribute we want to set
   * @param   {string} value - the value of the atribute to set
   * @returns {undefined} void function
   */

  function setAttribute(element, name, value) {
    cov_h9kep7qkr.f[5]++;
    cov_h9kep7qkr.s[13]++;

    if (isString(value)) {
      cov_h9kep7qkr.b[8][0]++;
      cov_h9kep7qkr.s[14]++;
      element.setAttribute(name, value);
    } else {
      cov_h9kep7qkr.b[8][1]++;
    }
  }
  /**
   * Get all the element attributes as object
   * @param   {HTMLElement} element - DOM node we want to parse
   * @returns {Object} all the attributes found as a key value pairs
   */

  function getAttributes(element) {
    cov_h9kep7qkr.f[6]++;
    cov_h9kep7qkr.s[15]++;
    return Array.from(element.attributes).reduce(function (acc, attribute) {
      cov_h9kep7qkr.f[7]++;
      cov_h9kep7qkr.s[16]++;
      acc[attribute.name] = attribute.value;
      cov_h9kep7qkr.s[17]++;
      return acc;
    }, {});
  }
  /**
   * Get the tag name of any DOM node
   * @param   {HTMLElement} element - DOM node we want to inspect
   * @returns {string} name to identify this dom node in riot
   */

  function getName(element) {
    cov_h9kep7qkr.f[8]++;
    cov_h9kep7qkr.s[18]++;
    return (cov_h9kep7qkr.b[9][0]++, getAttribute(element, IS_DIRECTIVE)) || (cov_h9kep7qkr.b[9][1]++, element.tagName.toLowerCase());
  }

  var cov_1cu520skt0 = function () {
    var path = "/Users/gianlucaguarini/Sites/riot/riot/src/utils/misc.js";
    var hash = "5fa7df6a8d8d2a70dcbadb785d435c7c2598b9be";

    var Function = function () {}.constructor;

    var global = new Function("return this")();
    var gcv = "__coverage__";
    var coverageData = {
      path: "/Users/gianlucaguarini/Sites/riot/riot/src/utils/misc.js",
      statementMap: {
        "0": {
          start: {
            line: 9,
            column: 2
          },
          end: {
            line: 9,
            column: 24
          }
        },
        "1": {
          start: {
            line: 18,
            column: 2
          },
          end: {
            line: 18,
            column: 90
          }
        },
        "2": {
          start: {
            line: 28,
            column: 2
          },
          end: {
            line: 30,
            column: 4
          }
        },
        "3": {
          start: {
            line: 29,
            column: 4
          },
          end: {
            line: 29,
            column: 41
          }
        },
        "4": {
          start: {
            line: 29,
            column: 22
          },
          end: {
            line: 29,
            column: 41
          }
        },
        "5": {
          start: {
            line: 32,
            column: 2
          },
          end: {
            line: 32,
            column: 15
          }
        },
        "6": {
          start: {
            line: 37,
            column: 2
          },
          end: {
            line: 37,
            column: 13
          }
        },
        "7": {
          start: {
            line: 47,
            column: 2
          },
          end: {
            line: 49,
            column: 4
          }
        },
        "8": {
          start: {
            line: 48,
            column: 4
          },
          end: {
            line: 48,
            column: 48
          }
        },
        "9": {
          start: {
            line: 51,
            column: 2
          },
          end: {
            line: 51,
            column: 15
          }
        },
        "10": {
          start: {
            line: 63,
            column: 2
          },
          end: {
            line: 69,
            column: 4
          }
        },
        "11": {
          start: {
            line: 71,
            column: 2
          },
          end: {
            line: 71,
            column: 15
          }
        },
        "12": {
          start: {
            line: 82,
            column: 2
          },
          end: {
            line: 84,
            column: 4
          }
        },
        "13": {
          start: {
            line: 83,
            column: 4
          },
          end: {
            line: 83,
            column: 47
          }
        },
        "14": {
          start: {
            line: 86,
            column: 2
          },
          end: {
            line: 86,
            column: 15
          }
        },
        "15": {
          start: {
            line: 96,
            column: 2
          },
          end: {
            line: 106,
            column: 8
          }
        },
        "16": {
          start: {
            line: 97,
            column: 18
          },
          end: {
            line: 97,
            column: 43
          }
        },
        "17": {
          start: {
            line: 99,
            column: 4
          },
          end: {
            line: 103,
            column: 5
          }
        },
        "18": {
          start: {
            line: 100,
            column: 6
          },
          end: {
            line: 100,
            column: 33
          }
        },
        "19": {
          start: {
            line: 102,
            column: 6
          },
          end: {
            line: 102,
            column: 31
          }
        },
        "20": {
          start: {
            line: 105,
            column: 4
          },
          end: {
            line: 105,
            column: 14
          }
        }
      },
      fnMap: {
        "0": {
          name: "panic",
          decl: {
            start: {
              line: 8,
              column: 16
            },
            end: {
              line: 8,
              column: 21
            }
          },
          loc: {
            start: {
              line: 8,
              column: 29
            },
            end: {
              line: 10,
              column: 1
            }
          },
          line: 8
        },
        "1": {
          name: "callOrAssign",
          decl: {
            start: {
              line: 17,
              column: 16
            },
            end: {
              line: 17,
              column: 28
            }
          },
          loc: {
            start: {
              line: 17,
              column: 37
            },
            end: {
              line: 19,
              column: 1
            }
          },
          line: 17
        },
        "2": {
          name: "defineDefaults",
          decl: {
            start: {
              line: 27,
              column: 16
            },
            end: {
              line: 27,
              column: 30
            }
          },
          loc: {
            start: {
              line: 27,
              column: 49
            },
            end: {
              line: 33,
              column: 1
            }
          },
          line: 27
        },
        "3": {
          name: "(anonymous_3)",
          decl: {
            start: {
              line: 28,
              column: 35
            },
            end: {
              line: 28,
              column: 36
            }
          },
          loc: {
            start: {
              line: 28,
              column: 53
            },
            end: {
              line: 30,
              column: 3
            }
          },
          line: 28
        },
        "4": {
          name: "noop",
          decl: {
            start: {
              line: 36,
              column: 16
            },
            end: {
              line: 36,
              column: 20
            }
          },
          loc: {
            start: {
              line: 36,
              column: 23
            },
            end: {
              line: 38,
              column: 1
            }
          },
          line: 36
        },
        "5": {
          name: "autobindMethods",
          decl: {
            start: {
              line: 46,
              column: 16
            },
            end: {
              line: 46,
              column: 31
            }
          },
          loc: {
            start: {
              line: 46,
              column: 49
            },
            end: {
              line: 52,
              column: 1
            }
          },
          line: 46
        },
        "6": {
          name: "(anonymous_6)",
          decl: {
            start: {
              line: 47,
              column: 18
            },
            end: {
              line: 47,
              column: 19
            }
          },
          loc: {
            start: {
              line: 47,
              column: 28
            },
            end: {
              line: 49,
              column: 3
            }
          },
          line: 47
        },
        "7": {
          name: "defineProperty",
          decl: {
            start: {
              line: 62,
              column: 16
            },
            end: {
              line: 62,
              column: 30
            }
          },
          loc: {
            start: {
              line: 62,
              column: 65
            },
            end: {
              line: 72,
              column: 1
            }
          },
          line: 62
        },
        "8": {
          name: "defineProperties",
          decl: {
            start: {
              line: 81,
              column: 16
            },
            end: {
              line: 81,
              column: 32
            }
          },
          loc: {
            start: {
              line: 81,
              column: 62
            },
            end: {
              line: 87,
              column: 1
            }
          },
          line: 81
        },
        "9": {
          name: "(anonymous_9)",
          decl: {
            start: {
              line: 82,
              column: 37
            },
            end: {
              line: 82,
              column: 38
            }
          },
          loc: {
            start: {
              line: 82,
              column: 55
            },
            end: {
              line: 84,
              column: 3
            }
          },
          line: 82
        },
        "10": {
          name: "evaluateAttributeExpressions",
          decl: {
            start: {
              line: 95,
              column: 16
            },
            end: {
              line: 95,
              column: 44
            }
          },
          loc: {
            start: {
              line: 95,
              column: 64
            },
            end: {
              line: 107,
              column: 1
            }
          },
          line: 95
        },
        "11": {
          name: "(anonymous_11)",
          decl: {
            start: {
              line: 96,
              column: 27
            },
            end: {
              line: 96,
              column: 28
            }
          },
          loc: {
            start: {
              line: 96,
              column: 47
            },
            end: {
              line: 106,
              column: 3
            }
          },
          line: 96
        }
      },
      branchMap: {
        "0": {
          loc: {
            start: {
              line: 18,
              column: 9
            },
            end: {
              line: 18,
              column: 90
            }
          },
          type: "cond-expr",
          locations: [{
            start: {
              line: 18,
              column: 31
            },
            end: {
              line: 18,
              column: 80
            }
          }, {
            start: {
              line: 18,
              column: 84
            },
            end: {
              line: 18,
              column: 90
            }
          }],
          line: 18
        },
        "1": {
          loc: {
            start: {
              line: 18,
              column: 31
            },
            end: {
              line: 18,
              column: 80
            }
          },
          type: "cond-expr",
          locations: [{
            start: {
              line: 18,
              column: 57
            },
            end: {
              line: 18,
              column: 69
            }
          }, {
            start: {
              line: 18,
              column: 72
            },
            end: {
              line: 18,
              column: 80
            }
          }],
          line: 18
        },
        "2": {
          loc: {
            start: {
              line: 29,
              column: 4
            },
            end: {
              line: 29,
              column: 41
            }
          },
          type: "if",
          locations: [{
            start: {
              line: 29,
              column: 4
            },
            end: {
              line: 29,
              column: 41
            }
          }, {
            start: {
              line: 29,
              column: 4
            },
            end: {
              line: 29,
              column: 41
            }
          }],
          line: 29
        },
        "3": {
          loc: {
            start: {
              line: 62,
              column: 51
            },
            end: {
              line: 62,
              column: 63
            }
          },
          type: "default-arg",
          locations: [{
            start: {
              line: 62,
              column: 61
            },
            end: {
              line: 62,
              column: 63
            }
          }],
          line: 62
        },
        "4": {
          loc: {
            start: {
              line: 99,
              column: 4
            },
            end: {
              line: 103,
              column: 5
            }
          },
          type: "if",
          locations: [{
            start: {
              line: 99,
              column: 4
            },
            end: {
              line: 103,
              column: 5
            }
          }, {
            start: {
              line: 99,
              column: 4
            },
            end: {
              line: 103,
              column: 5
            }
          }],
          line: 99
        }
      },
      s: {
        "0": 0,
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0,
        "6": 0,
        "7": 0,
        "8": 0,
        "9": 0,
        "10": 0,
        "11": 0,
        "12": 0,
        "13": 0,
        "14": 0,
        "15": 0,
        "16": 0,
        "17": 0,
        "18": 0,
        "19": 0,
        "20": 0
      },
      f: {
        "0": 0,
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0,
        "6": 0,
        "7": 0,
        "8": 0,
        "9": 0,
        "10": 0,
        "11": 0
      },
      b: {
        "0": [0, 0],
        "1": [0, 0],
        "2": [0, 0],
        "3": [0],
        "4": [0, 0]
      },
      _coverageSchema: "43e27e138ebf9cfc5966b082cf9a028302ed4184"
    };
    var coverage = global[gcv] || (global[gcv] = {});

    if (coverage[path] && coverage[path].hash === hash) {
      return coverage[path];
    }

    coverageData.hash = hash;
    return coverage[path] = coverageData;
  }();
  /**
   * Throw an error
   * @param {string} error - error message
   * @returns {undefined} it's a IO void function
   */

  function panic(error) {
    cov_1cu520skt0.f[0]++;
    cov_1cu520skt0.s[0]++;
    throw new Error(error);
  }
  /**
   * Call the first argument received only if it's a function otherwise return it as it is
   * @param   {*} source - anything
   * @returns {*} anything
   */

  function callOrAssign(source) {
    cov_1cu520skt0.f[1]++;
    cov_1cu520skt0.s[1]++;
    return isFunction(source) ? (cov_1cu520skt0.b[0][0]++, source.constructor.name ? (cov_1cu520skt0.b[1][0]++, new source()) : (cov_1cu520skt0.b[1][1]++, source())) : (cov_1cu520skt0.b[0][1]++, source);
  }
  /**
   * Define default properties if they don't exist on the source object
   * @param   {Object} source - object that will receive the default properties
   * @param   {Object} defaults - object containing additional optional keys
   * @returns {Object} the original object received enhanced
   */

  function defineDefaults(source, defaults) {
    cov_1cu520skt0.f[2]++;
    cov_1cu520skt0.s[2]++;
    Object.entries(defaults).forEach(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          key = _ref2[0],
          value = _ref2[1];

      cov_1cu520skt0.f[3]++;
      cov_1cu520skt0.s[3]++;

      if (!source[key]) {
        cov_1cu520skt0.b[2][0]++;
        cov_1cu520skt0.s[4]++;
        source[key] = value;
      } else {
        cov_1cu520skt0.b[2][1]++;
      }
    });
    cov_1cu520skt0.s[5]++;
    return source;
  } // doese simply nothing

  function noop() {
    cov_1cu520skt0.f[4]++;
    cov_1cu520skt0.s[6]++;
    return this;
  }
  /**
   * Autobind the methods of a source object to itself
   * @param   {Object} source - probably a riot tag instance
   * @param   {Array<string>} methods - list of the methods to autobind
   * @returns {Object} the original object received
   */

  function autobindMethods(source, methods) {
    cov_1cu520skt0.f[5]++;
    cov_1cu520skt0.s[7]++;
    methods.forEach(function (method) {
      cov_1cu520skt0.f[6]++;
      cov_1cu520skt0.s[8]++;
      source[method] = source[method].bind(source);
    });
    cov_1cu520skt0.s[9]++;
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

  function defineProperty(source, key, value) {
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : (cov_1cu520skt0.b[3][0]++, {});
    cov_1cu520skt0.f[7]++;
    cov_1cu520skt0.s[10]++;
    Object.defineProperty(source, key, _objectSpread({
      value: value,
      enumerable: false,
      writable: false,
      configurable: true
    }, options));
    cov_1cu520skt0.s[11]++;
    return source;
  }
  /**
   * Define multiple properties on a target object
   * @param   {Object} source - object where the new properties will be set
   * @param   {Object} properties - object containing as key pair the key + value properties
   * @param   {Object} options - set the propery overriding the default options
   * @returns {Object} the original object modified
   */

  function defineProperties(source, properties, options) {
    cov_1cu520skt0.f[8]++;
    cov_1cu520skt0.s[12]++;
    Object.entries(properties).forEach(function (_ref3) {
      var _ref4 = _slicedToArray(_ref3, 2),
          key = _ref4[0],
          value = _ref4[1];

      cov_1cu520skt0.f[9]++;
      cov_1cu520skt0.s[13]++;
      defineProperty(source, key, value, options);
    });
    cov_1cu520skt0.s[14]++;
    return source;
  }
  /**
   * Evaluate a list of attribute expressions
   * @param   {Array} attributes - attribute expressions generated by the riot compiler
   * @param   {Object} scope - current scope
   * @returns {Object} key value pairs with the result of the computation
   */

  function evaluateAttributeExpressions(attributes, scope) {
    cov_1cu520skt0.f[10]++;
    cov_1cu520skt0.s[15]++;
    return attributes.reduce(function (acc, attribute) {
      cov_1cu520skt0.f[11]++;
      var value = (cov_1cu520skt0.s[16]++, attribute.evaluate(scope));
      cov_1cu520skt0.s[17]++;

      if (attribute.name) {
        cov_1cu520skt0.b[4][0]++;
        cov_1cu520skt0.s[18]++;
        acc[attribute.name] = value;
      } else {
        cov_1cu520skt0.b[4][1]++;
        cov_1cu520skt0.s[19]++;
        Object.assign(acc, value);
      }

      cov_1cu520skt0.s[20]++;
      return acc;
    }, {});
  }

  /**
   * Remove the child nodes from any DOM node
   * @param   {HTMLElement} node - target node
   * @returns {undefined}
   */
  function cleanNode(node) {
    const children = node.childNodes;
    children.forEach(n => node.removeChild(n));
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

  /*! (c) Andrea Giammarchi - ISC */
  var self = null || /* istanbul ignore next */ {};
  try { self.Map = Map; }
  catch (Map) {
    self.Map = function Map() {
      var i = 0;
      var k = [];
      var v = [];
      return {
        delete: function (key) {
          var had = contains(key);
          if (had) {
            k.splice(i, 1);
            v.splice(i, 1);
          }
          return had;
        },
        get: function get(key) {
          return contains(key) ? v[i] : void 0;
        },
        has: function has(key) {
          return contains(key);
        },
        set: function set(key, value) {
          v[contains(key) ? i : (k.push(key) - 1)] = value;
          return this;
        }
      };
      function contains(v) {
        i = k.indexOf(v);
        return -1 < i;
      }
    };
  }
  var Map$1 = self.Map;

  const append = (get, parent, children, start, end, before) => {
    if ((end - start) < 2)
      parent.insertBefore(get(children[start], 1), before);
    else {
      const fragment = parent.ownerDocument.createDocumentFragment();
      while (start < end)
        fragment.appendChild(get(children[start++], 1));
      parent.insertBefore(fragment, before);
    }
  };

  const eqeq = (a, b) => a == b;

  const identity = O => O;

  const indexOf = (
    moreNodes,
    moreStart,
    moreEnd,
    lessNodes,
    lessStart,
    lessEnd,
    compare
  ) => {
    const length = lessEnd - lessStart;
    /* istanbul ignore if */
    if (length < 1)
      return -1;
    while ((moreEnd - moreStart) >= length) {
      let m = moreStart;
      let l = lessStart;
      while (
        m < moreEnd &&
        l < lessEnd &&
        compare(moreNodes[m], lessNodes[l])
      ) {
        m++;
        l++;
      }
      if (l === lessEnd)
        return moreStart;
      moreStart = m + 1;
    }
    return -1;
  };

  const isReversed = (
    futureNodes,
    futureEnd,
    currentNodes,
    currentStart,
    currentEnd,
    compare
  ) => {
    while (
      currentStart < currentEnd &&
      compare(
        currentNodes[currentStart],
        futureNodes[futureEnd - 1]
      )) {
        currentStart++;
        futureEnd--;
      }  return futureEnd === 0;
  };

  const next = (get, list, i, length, before) => i < length ?
                get(list[i], 0) :
                (0 < i ?
                  get(list[i - 1], -0).nextSibling :
                  before);

  const remove = (get, parent, children, start, end) => {
    if ((end - start) < 2)
      parent.removeChild(get(children[start], -1));
    else {
      const range = parent.ownerDocument.createRange();
      range.setStartBefore(get(children[start], -1));
      range.setEndAfter(get(children[end - 1], -1));
      range.deleteContents();
    }
  };

  // - - - - - - - - - - - - - - - - - - -
  // diff related constants and utilities
  // - - - - - - - - - - - - - - - - - - -

  const DELETION = -1;
  const INSERTION = 1;
  const SKIP = 0;
  const SKIP_OND = 50;

  const HS = (
    futureNodes,
    futureStart,
    futureEnd,
    futureChanges,
    currentNodes,
    currentStart,
    currentEnd,
    currentChanges
  ) => {

    let k = 0;
    /* istanbul ignore next */
    let minLen = futureChanges < currentChanges ? futureChanges : currentChanges;
    const link = Array(minLen++);
    const tresh = Array(minLen);
    tresh[0] = -1;

    for (let i = 1; i < minLen; i++)
      tresh[i] = currentEnd;

    const keymap = new Map$1;
    for (let i = currentStart; i < currentEnd; i++)
      keymap.set(currentNodes[i], i);

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
      const {newi, oldi} = ptr;
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
  };

  // this is pretty much the same petit-dom code without the delete map part
  // https://github.com/yelouafi/petit-dom/blob/bd6f5c919b5ae5297be01612c524c40be45f14a7/src/vdom.js#L556-L561
  const OND = (
    futureNodes,
    futureStart,
    rows,
    currentNodes,
    currentStart,
    cols,
    compare
  ) => {
    const length = rows + cols;
    const v = [];
    let d, k, r, c, pv, cv, pd;
    outer: for (d = 0; d <= length; d++) {
      /* istanbul ignore if */
      if (d > SKIP_OND)
        return null;
      pd = d - 1;
      /* istanbul ignore next */
      pv = d ? v[d - 1] : [0, 0];
      cv = v[d] = [];
      for (k = -d; k <= d; k += 2) {
        if (k === -d || (k !== d && pv[pd + k - 1] < pv[pd + k + 1])) {
          c = pv[pd + k + 1];
        } else {
          c = pv[pd + k - 1] + 1;
        }
        r = c - k;
        while (
          c < cols &&
          r < rows &&
          compare(
            currentNodes[currentStart + c],
            futureNodes[futureStart + r]
          )
        ) {
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
      while (
        c > 0 &&
        r > 0 &&
        compare(
          currentNodes[currentStart + c - 1],
          futureNodes[futureStart + r - 1]
        )
      ) {
        // diagonal edge = equality
        diff[diffIdx--] = SKIP;
        c--;
        r--;
      }
      if (!d)
        break;
      pd = d - 1;
      /* istanbul ignore next */
      pv = d ? v[d - 1] : [0, 0];
      k = c - r;
      if (k === -d || (k !== d && pv[pd + k - 1] < pv[pd + k + 1])) {
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

  const applyDiff = (
    diff,
    get,
    parentNode,
    futureNodes,
    futureStart,
    currentNodes,
    currentStart,
    currentLength,
    before
  ) => {
    const live = new Map$1;
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
          append(
            get,
            parentNode,
            futureNodes,
            futureStart++,
            futureStart,
            currentIndex < currentLength ?
              get(currentNodes[currentIndex], 0) :
              before
          );
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
          if (live.has(currentNodes[currentStart]))
            currentStart++;
          else
            remove(
              get,
              parentNode,
              currentNodes,
              currentStart++,
              currentStart
            );
          break;
      }
    }
  };

  const findK = (ktr, length, j) => {
    let lo = 1;
    let hi = length;
    while (lo < hi) {
      const mid = ((lo + hi) / 2) >>> 0;
      if (j < ktr[mid])
        hi = mid;
      else
        lo = mid + 1;
    }
    return lo;
  };

  const smartDiff = (
    get,
    parentNode,
    futureNodes,
    futureStart,
    futureEnd,
    futureChanges,
    currentNodes,
    currentStart,
    currentEnd,
    currentChanges,
    currentLength,
    compare,
    before
  ) => {
    applyDiff(
      OND(
        futureNodes,
        futureStart,
        futureChanges,
        currentNodes,
        currentStart,
        currentChanges,
        compare
      ) ||
      HS(
        futureNodes,
        futureStart,
        futureEnd,
        futureChanges,
        currentNodes,
        currentStart,
        currentEnd,
        currentChanges
      ),
      get,
      parentNode,
      futureNodes,
      futureStart,
      currentNodes,
      currentStart,
      currentLength,
      before
    );
  };

  /*! (c) 2018 Andrea Giammarchi (ISC) */

  const domdiff = (
    parentNode,     // where changes happen
    currentNodes,   // Array of current items/nodes
    futureNodes,    // Array of future items/nodes
    options         // optional object with one of the following properties
                    //  before: domNode
                    //  compare(generic, generic) => true if same generic
                    //  node(generic) => Node
  ) => {
    if (!options)
      options = {};

    const compare = options.compare || eqeq;
    const get = options.node || identity;
    const before = options.before == null ? null : get(options.before, 0);

    const currentLength = currentNodes.length;
    let currentEnd = currentLength;
    let currentStart = 0;

    let futureEnd = futureNodes.length;
    let futureStart = 0;

    // common prefix
    while (
      currentStart < currentEnd &&
      futureStart < futureEnd &&
      compare(currentNodes[currentStart], futureNodes[futureStart])
    ) {
      currentStart++;
      futureStart++;
    }

    // common suffix
    while (
      currentStart < currentEnd &&
      futureStart < futureEnd &&
      compare(currentNodes[currentEnd - 1], futureNodes[futureEnd - 1])
    ) {
      currentEnd--;
      futureEnd--;
    }

    const currentSame = currentStart === currentEnd;
    const futureSame = futureStart === futureEnd;

    // same list
    if (currentSame && futureSame)
      return futureNodes;

    // only stuff to add
    if (currentSame && futureStart < futureEnd) {
      append(
        get,
        parentNode,
        futureNodes,
        futureStart,
        futureEnd,
        next(get, currentNodes, currentStart, currentLength, before)
      );
      return futureNodes;
    }

    // only stuff to remove
    if (futureSame && currentStart < currentEnd) {
      remove(
        get,
        parentNode,
        currentNodes,
        currentStart,
        currentEnd
      );
      return futureNodes;
    }

    const currentChanges = currentEnd - currentStart;
    const futureChanges = futureEnd - futureStart;
    let i = -1;

    // 2 simple indels: the shortest sequence is a subsequence of the longest
    if (currentChanges < futureChanges) {
      i = indexOf(
        futureNodes,
        futureStart,
        futureEnd,
        currentNodes,
        currentStart,
        currentEnd,
        compare
      );
      // inner diff
      if (-1 < i) {
        append(
          get,
          parentNode,
          futureNodes,
          futureStart,
          i,
          get(currentNodes[currentStart], 0)
        );
        append(
          get,
          parentNode,
          futureNodes,
          i + currentChanges,
          futureEnd,
          next(get, currentNodes, currentEnd, currentLength, before)
        );
        return futureNodes;
      }
    }
    /* istanbul ignore else */
    else if (futureChanges < currentChanges) {
      i = indexOf(
        currentNodes,
        currentStart,
        currentEnd,
        futureNodes,
        futureStart,
        futureEnd,
        compare
      );
      // outer diff
      if (-1 < i) {
        remove(
          get,
          parentNode,
          currentNodes,
          currentStart,
          i
        );
        remove(
          get,
          parentNode,
          currentNodes,
          i + futureChanges,
          currentEnd
        );
        return futureNodes;
      }
    }

    // common case with one replacement for many nodes
    // or many nodes replaced for a single one
    /* istanbul ignore else */
    if ((currentChanges < 2 || futureChanges < 2)) {
      append(
        get,
        parentNode,
        futureNodes,
        futureStart,
        futureEnd,
        get(currentNodes[currentStart], 0)
      );
      remove(
        get,
        parentNode,
        currentNodes,
        currentStart,
        currentEnd
      );
      return futureNodes;
    }

    // the half match diff part has been skipped in petit-dom
    // https://github.com/yelouafi/petit-dom/blob/bd6f5c919b5ae5297be01612c524c40be45f14a7/src/vdom.js#L391-L397
    // accordingly, I think it's safe to skip in here too
    // if one day it'll come out like the speediest thing ever to do
    // then I might add it in here too

    // Extra: before going too fancy, what about reversed lists ?
    //        This should bail out pretty quickly if that's not the case.
    if (
      currentChanges === futureChanges &&
      isReversed(
        futureNodes,
        futureEnd,
        currentNodes,
        currentStart,
        currentEnd,
        compare
      )
    ) {
      append(
        get,
        parentNode,
        futureNodes,
        futureStart,
        futureEnd,
        next(get, currentNodes, currentEnd, currentLength, before)
      );
      return futureNodes;
    }

    // last resort through a smart diff
    smartDiff(
      get,
      parentNode,
      futureNodes,
      futureStart,
      futureEnd,
      futureChanges,
      currentNodes,
      currentStart,
      currentEnd,
      currentChanges,
      currentLength,
      compare,
      before
    );

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
      return this.update(scope)
    },
    update(scope) {
      const { placeholder } = this;
      const collection = this.evaluate(scope);
      const items = collection ? Array.from(collection) : [];
      const parent = placeholder.parentNode;

      // prepare the diffing
      const { newChildrenMap, batches, futureNodes } = loopItems(items, scope, this);

      /**
       * DOM Updates
       */
      const before = this.tags[this.tags.length - 1];
      domdiff(parent, this.tags, futureNodes, {
        before: before ? before.nextSibling : placeholder.nextSibling
      });

      // trigger the mounts and the updates
      batches.forEach(fn => fn());

      // update the children map
      this.childrenMap = newChildrenMap;
      this.tags = futureNodes;

      return this
    },
    unmount() {
      Array
        .from(this.childrenMap.values())
        .forEach(({tag, context}) => {
          tag.unmount(context, true);
        });

      this.childrenMap = new Map();
      this.tags = [];

      return this
    }
  });

  /**
   * Check whether a tag must be filtered from a loop
   * @param   {Function} condition - filter function
   * @param   {Object} context - argument passed to the filter function
   * @returns {boolean} true if this item should be skipped
   */
  function mustFilterItem(condition, context) {
    return condition ? Boolean(condition(context)) === false : false
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
  function getContext({itemName, indexName, index, item, scope}) {
    const context = {
      [itemName]: item,
      ...scope
    };

    if (indexName) {
      return {
        [indexName]: index,
        ...context
      }
    }

    return context
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
    const { condition, template, childrenMap, itemName, getKey, indexName, root } = binding;
    const filteredItems = new Set();
    const newChildrenMap = new Map();
    const batches = [];
    const futureNodes = [];

    items.forEach((item, i) => {
      // the real item index should be subtracted to the items that were filtered
      const index = i - filteredItems.size;
      const context = getContext({itemName, indexName, index, item, scope});
      const key = getKey ? getKey(context) : index;
      const oldItem = childrenMap.get(key);

      if (mustFilterItem(condition, context)) {
        filteredItems.add(oldItem);
        return
      }

      const tag = oldItem ? oldItem.tag : template.clone();
      const el = oldItem ? tag.el : root.cloneNode();

      if (!oldItem) {
        batches.push(() => tag.mount(el, context));
      } else {
        batches.push(() => tag.update(context));
      }

      futureNodes.push(el);

      // update the children map
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
    }
  }

  function create(node, { evaluate, condition, itemName, indexName, getKey, template }) {
    const placeholder = document.createTextNode('');
    const parent = node.parentNode;
    const root = node.cloneNode();
    const offset = Array.from(parent.childNodes).indexOf(node);

    parent.insertBefore(placeholder, node);
    parent.removeChild(node);

    return {
      ...EachBinding,
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
    }
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
      return this.update(scope)
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
        break
      case mustUnmount:
        swap(this.placeholder, this.node);
        this.unmount(scope);
        break
      default:
        if (value) this.template.update(scope);
      }

      this.value = value;

      return this
    },
    unmount(scope) {
      const { template } = this;

      if (template) {
        template.unmount(scope);
      }

      return this
    }
  });

  function swap(inNode, outNode) {
    const parent = outNode.parentNode;
    parent.insertBefore(inNode, outNode);
    parent.removeChild(outNode);
  }

  function create$1(node, { evaluate, template }) {
    return {
      ...IfBinding,
      node,
      evaluate,
      placeholder: document.createTextNode(''),
      template: template.createDOM(node)
    }
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
    Object
      .entries(attributes)
      .forEach(([name, value]) => attributeExpression(node, { name }, value));
  }

  /**
   * Remove all the attributes provided
   * @param   {HTMLElement} node - target node
   * @param   {Object} attributes - object containing all the attribute names
   * @returns {undefined} sorry it's a void function :(
   */
  function removeAllAttributes(node, attributes) {
    Object
      .keys(attributes)
      .forEach(attribute => node.removeAttribute(attribute));
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
  function attributeExpression(node, { name }, value, oldValue) {
    // is it a spread operator? {...attributes}
    if (!name) {
      // is the value still truthy?
      if (value) {
        setAllAttributes(node, value);
      } else if (oldValue) {
        // otherwise remove all the old attributes
        removeAllAttributes(node, oldValue);
      }

      return
    }

    // handle boolean attributes
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
    return value && typeof value !== 'object' ? SET_ATTIBUTE : REMOVE_ATTRIBUTE
  }

  /**
   * Get the value as string
   * @param   {string} name - attribute name
   * @param   {*} value - user input value
   * @returns {string} input value as string
   */
  function normalizeValue(name, value) {
    // be sure that expressions like selected={ true } will be always rendered as selected='selected'
    if (value === true) return name

    return value
  }

  /**
   * Set a new event listener
   * @param   {HTMLElement} node - target node
   * @param   {Object} expression - expression object
   * @param   {string} expression.name - event name
   * @param   {*} value - new expression value
   * @returns {undefined}
   */
  function eventExpression(node, { name }, value) {
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
  function textExpression(node, { childNodeIndex }, value) {
    const target = node.childNodes[childNodeIndex];
    const val = normalizeValue$1(value);

    // replace the target if it's a placeholder comment
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
    return value != null ? value : ''
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
      return this
    }
  });

  /**
   * IO() function to handle the DOM updates
   * @param {Expression} expression - expression object
   * @param {*} value - current expression value
   * @returns {undefined}
   */
  function apply(expression, value) {
    return expressions[expression.type](expression.node, expression, value, expression.value)
  }

  function create$2(node, data) {
    return {
      ...Expression,
      ...data,
      node
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
          return collection.map(item => item[method](scope)) && context
        }
      }
    }, {})
  }

  function create$3(node, { expressions }) {
    return {
      ...flattenCollectionMethods(
        expressions.map(expression => create$2(node, expression)),
        ['mount', 'update', 'unmount']
      )
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
    return create$6(slotsToMarkup(slots), [
      ...slotBindings(slots), {
      // the attributes should be registered as binding
      // if we fallback to a normal template chunk
        expressions: attributes.map(attr => {
          return {
            type: ATTRIBUTE,
            ...attr
          }
        })
      }
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
      return this.update(scope)
    },
    update(scope) {
      const name = this.evaluate(scope);

      // simple update
      if (name === this.name) {
        this.tag.update(scope);
      } else {
        // unmount the old tag if it exists
        if (this.tag) {
          this.tag.unmount(scope);
        }

        // mount the new tag
        this.name = name;
        this.tag = getTag(this.getComponent(name), this.slots, this.attributes);
        this.tag.mount(this.node, scope);
      }

      return this
    },
    unmount(scope) {
      if (this.tag) {
        this.tag.unmount(scope);
      }

      return this
    }
  });

  function create$4(node, { evaluate, getComponent, slots, attributes }) {
    return {
      ...TagBinding,
      node,
      evaluate,
      slots,
      attributes,
      getComponent
    }
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
    const { selector, type, redundantAttribute, expressions } = binding;
    // find the node to apply the bindings
    const node = selector ? root.querySelector(selector) : root;
    // remove eventually additional attributes created only to select this node
    if (redundantAttribute) node.removeAttribute(redundantAttribute);

    // init the binding
    return (bindings[type] || bindings[SIMPLE])(
      node,
      {
        ...binding,
        expressions: expressions || []
      }
    )
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

  // in this case a simple innerHTML is enough
  function createHTMLTree(html) {
    const template = document.createElement('template');
    template.innerHTML = html;
    return template.content
  }

  // for svg nodes we need a bit more work
  function creteSVGTree(html, container) {
    // create the SVGNode
    const svgNode = container.ownerDocument.importNode(
      new window.DOMParser()
        .parseFromString(
          `<svg xmlns="http://www.w3.org/2000/svg">${html}</svg>`,
          'application/xml'
        )
        .documentElement,
      true
    );

    return svgNode
  }

  /**
   * Create the DOM that will be injected
   * @param {Object} root - DOM node to find out the context where the fragment will be created
   * @param   {string} html - DOM to create as string
   * @returns {HTMLDocumentFragment|HTMLElement} a new html fragment
   */
  function createDOMTree(root, html) {
    if (isSvg(root)) return creteSVGTree(html, root)

    return createHTMLTree(html)
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
    return html && (typeof html === 'string' ?
      createDOMTree(el, html) :
      html)
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

      return this
    },

    // API methods
    /**
     * Attach the template to a DOM node
     * @param   {HTMLElement} el - target DOM node
     * @param   {*} scope - template data
     * @returns {TemplateChunk} self
     */
    mount(el, scope) {
      if (!el) throw new Error('Please provide DOM node to mount properly your template')

      if (this.el) this.unmount(scope);

      this.el = el;

      // create the DOM if it wasn't created before
      this.createDOM(el);

      if (this.dom) injectDOM(el, this.dom.cloneNode(true));

      // create the bindings
      this.bindings = this.bindingsData.map(binding => create$5(this.el, binding));
      this.bindings.forEach(b => b.mount(scope));

      return this
    },
    /**
     * Update the template with fresh data
     * @param   {*} scope - template data
     * @returns {TemplateChunk} self
     */
    update(scope) {
      this.bindings.forEach(b => b.update(scope));

      return this
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

        if (mustRemoveRoot) {
          this.el.parentNode.removeChild(this.el);
        }

        this.el = null;
      }

      return this
    },
    /**
     * Clone the template chunk
     * @returns {TemplateChunk} a clone of this object resetting the this.el property
     */
    clone() {
      return {
        ...this,
        el: null
      }
    }
  });

  /**
   * Create a template chunk wiring also the bindings
   * @param   {string|HTMLElement} html - template string
   * @param   {Array} bindings - bindings collection
   * @returns {TemplateChunk} a new TemplateChunk copy
   */
  function create$6(html, bindings = []) {
    return {
      ...TemplateChunk,
      html,
      bindingsData: bindings
    }
  }

  /**
   * Method used to bind expressions to a DOM node
   * @param   {string|HTMLElement} html - your static template html structure
   * @param   {Array} bindings - list of the expressions to bind to update the markup
   * @returns {TemplateChunk} a new TemplateChunk object having the `update`,`mount`, `unmount` and `clone` methods
   *
   * @example
   *
   * riotDOMBindings
   *  .template(
   *   `<div expr0><!----></div><div><p expr1><!----><section expr2></section></p>`,
   *   [
   *     {
   *       selector: '[expr0]',
   *       redundantAttribute: 'expr0',
   *       expressions: [
   *         {
   *           type: expressionTypes.TEXT,
   *           childNodeIndex: 0,
   *           evaluate(scope) {
   *             return scope.time;
   *           },
   *         },
   *       ],
   *     },
   *     {
   *       selector: '[expr1]',
   *       redundantAttribute: 'expr1',
   *       expressions: [
   *         {
   *           type: expressionTypes.TEXT,
   *           childNodeIndex: 0,
   *           evaluate(scope) {
   *             return scope.name;
   *           },
   *         },
   *         {
   *           type: 'attribute',
   *           name: 'style',
   *           evaluate(scope) {
   *             return scope.style;
   *           },
   *         },
   *       ],
   *     },
   *     {
   *       selector: '[expr2]',
   *       redundantAttribute: 'expr2',
   *       type: bindingTypes.IF,
   *       evaluate(scope) {
   *         return scope.isVisible;
   *       },
   *       template: riotDOMBindings.template('hello there'),
   *     },
   *   ]
   * )
   */

  var cov_e4r0v40ck = function () {
    var path = "/Users/gianlucaguarini/Sites/riot/riot/src/core/slots.js";
    var hash = "9967baba815485cffb56b674e490711af1f67e8f";

    var Function = function () {}.constructor;

    var global = new Function("return this")();
    var gcv = "__coverage__";
    var coverageData = {
      path: "/Users/gianlucaguarini/Sites/riot/riot/src/core/slots.js",
      statementMap: {
        "0": {
          start: {
            line: 7,
            column: 20
          },
          end: {
            line: 36,
            column: 2
          }
        },
        "1": {
          start: {
            line: 15,
            column: 4
          },
          end: {
            line: 20,
            column: 5
          }
        },
        "2": {
          start: {
            line: 16,
            column: 6
          },
          end: {
            line: 16,
            column: 49
          }
        },
        "3": {
          start: {
            line: 18,
            column: 6
          },
          end: {
            line: 18,
            column: 43
          }
        },
        "4": {
          start: {
            line: 19,
            column: 6
          },
          end: {
            line: 19,
            column: 37
          }
        },
        "5": {
          start: {
            line: 22,
            column: 4
          },
          end: {
            line: 22,
            column: 15
          }
        },
        "6": {
          start: {
            line: 25,
            column: 4
          },
          end: {
            line: 25,
            column: 35
          }
        },
        "7": {
          start: {
            line: 25,
            column: 24
          },
          end: {
            line: 25,
            column: 35
          }
        },
        "8": {
          start: {
            line: 26,
            column: 4
          },
          end: {
            line: 26,
            column: 31
          }
        },
        "9": {
          start: {
            line: 28,
            column: 4
          },
          end: {
            line: 28,
            column: 15
          }
        },
        "10": {
          start: {
            line: 31,
            column: 4
          },
          end: {
            line: 31,
            column: 35
          }
        },
        "11": {
          start: {
            line: 31,
            column: 24
          },
          end: {
            line: 31,
            column: 35
          }
        },
        "12": {
          start: {
            line: 32,
            column: 4
          },
          end: {
            line: 32,
            column: 32
          }
        },
        "13": {
          start: {
            line: 34,
            column: 4
          },
          end: {
            line: 34,
            column: 15
          }
        },
        "14": {
          start: {
            line: 44,
            column: 2
          },
          end: {
            line: 47,
            column: 3
          }
        },
        "15": {
          start: {
            line: 45,
            column: 4
          },
          end: {
            line: 45,
            column: 55
          }
        },
        "16": {
          start: {
            line: 46,
            column: 4
          },
          end: {
            line: 46,
            column: 30
          }
        },
        "17": {
          start: {
            line: 49,
            column: 2
          },
          end: {
            line: 51,
            column: 3
          }
        },
        "18": {
          start: {
            line: 50,
            column: 4
          },
          end: {
            line: 50,
            column: 37
          }
        },
        "19": {
          start: {
            line: 63,
            column: 23
          },
          end: {
            line: 63,
            column: 56
          }
        },
        "20": {
          start: {
            line: 63,
            column: 44
          },
          end: {
            line: 63,
            column: 55
          }
        },
        "21": {
          start: {
            line: 65,
            column: 2
          },
          end: {
            line: 73,
            column: 3
          }
        },
        "22": {
          start: {
            line: 83,
            column: 20
          },
          end: {
            line: 83,
            column: 36
          }
        },
        "23": {
          start: {
            line: 84,
            column: 24
          },
          end: {
            line: 87,
            column: 4
          }
        },
        "24": {
          start: {
            line: 85,
            column: 17
          },
          end: {
            line: 85,
            column: 56
          }
        },
        "25": {
          start: {
            line: 86,
            column: 4
          },
          end: {
            line: 86,
            column: 50
          }
        },
        "26": {
          start: {
            line: 89,
            column: 2
          },
          end: {
            line: 102,
            column: 3
          }
        },
        "27": {
          start: {
            line: 91,
            column: 6
          },
          end: {
            line: 91,
            column: 48
          }
        },
        "28": {
          start: {
            line: 91,
            column: 33
          },
          end: {
            line: 91,
            column: 47
          }
        },
        "29": {
          start: {
            line: 92,
            column: 6
          },
          end: {
            line: 92,
            column: 17
          }
        },
        "30": {
          start: {
            line: 95,
            column: 6
          },
          end: {
            line: 95,
            column: 49
          }
        },
        "31": {
          start: {
            line: 95,
            column: 33
          },
          end: {
            line: 95,
            column: 48
          }
        },
        "32": {
          start: {
            line: 96,
            column: 6
          },
          end: {
            line: 96,
            column: 17
          }
        },
        "33": {
          start: {
            line: 99,
            column: 6
          },
          end: {
            line: 99,
            column: 50
          }
        },
        "34": {
          start: {
            line: 99,
            column: 33
          },
          end: {
            line: 99,
            column: 49
          }
        },
        "35": {
          start: {
            line: 100,
            column: 6
          },
          end: {
            line: 100,
            column: 17
          }
        }
      },
      fnMap: {
        "0": {
          name: "(anonymous_0)",
          decl: {
            start: {
              line: 14,
              column: 2
            },
            end: {
              line: 14,
              column: 3
            }
          },
          loc: {
            start: {
              line: 14,
              column: 15
            },
            end: {
              line: 23,
              column: 3
            }
          },
          line: 14
        },
        "1": {
          name: "(anonymous_1)",
          decl: {
            start: {
              line: 24,
              column: 2
            },
            end: {
              line: 24,
              column: 3
            }
          },
          loc: {
            start: {
              line: 24,
              column: 16
            },
            end: {
              line: 29,
              column: 3
            }
          },
          line: 24
        },
        "2": {
          name: "(anonymous_2)",
          decl: {
            start: {
              line: 30,
              column: 2
            },
            end: {
              line: 30,
              column: 3
            }
          },
          loc: {
            start: {
              line: 30,
              column: 17
            },
            end: {
              line: 35,
              column: 3
            }
          },
          line: 30
        },
        "3": {
          name: "moveSlotInnerContent",
          decl: {
            start: {
              line: 43,
              column: 9
            },
            end: {
              line: 43,
              column: 29
            }
          },
          loc: {
            start: {
              line: 43,
              column: 36
            },
            end: {
              line: 52,
              column: 1
            }
          },
          line: 43
        },
        "4": {
          name: "createSlot",
          decl: {
            start: {
              line: 62,
              column: 9
            },
            end: {
              line: 62,
              column: 19
            }
          },
          loc: {
            start: {
              line: 62,
              column: 49
            },
            end: {
              line: 74,
              column: 1
            }
          },
          line: 62
        },
        "5": {
          name: "(anonymous_5)",
          decl: {
            start: {
              line: 63,
              column: 34
            },
            end: {
              line: 63,
              column: 35
            }
          },
          loc: {
            start: {
              line: 63,
              column: 44
            },
            end: {
              line: 63,
              column: 55
            }
          },
          line: 63
        },
        "6": {
          name: "createSlots",
          decl: {
            start: {
              line: 82,
              column: 24
            },
            end: {
              line: 82,
              column: 35
            }
          },
          loc: {
            start: {
              line: 82,
              column: 49
            },
            end: {
              line: 104,
              column: 1
            }
          },
          line: 82
        },
        "7": {
          name: "(anonymous_7)",
          decl: {
            start: {
              line: 84,
              column: 38
            },
            end: {
              line: 84,
              column: 39
            }
          },
          loc: {
            start: {
              line: 84,
              column: 46
            },
            end: {
              line: 87,
              column: 3
            }
          },
          line: 84
        },
        "8": {
          name: "(anonymous_8)",
          decl: {
            start: {
              line: 90,
              column: 4
            },
            end: {
              line: 90,
              column: 5
            }
          },
          loc: {
            start: {
              line: 90,
              column: 17
            },
            end: {
              line: 93,
              column: 5
            }
          },
          line: 90
        },
        "9": {
          name: "(anonymous_9)",
          decl: {
            start: {
              line: 91,
              column: 28
            },
            end: {
              line: 91,
              column: 29
            }
          },
          loc: {
            start: {
              line: 91,
              column: 33
            },
            end: {
              line: 91,
              column: 47
            }
          },
          line: 91
        },
        "10": {
          name: "(anonymous_10)",
          decl: {
            start: {
              line: 94,
              column: 4
            },
            end: {
              line: 94,
              column: 5
            }
          },
          loc: {
            start: {
              line: 94,
              column: 18
            },
            end: {
              line: 97,
              column: 5
            }
          },
          line: 94
        },
        "11": {
          name: "(anonymous_11)",
          decl: {
            start: {
              line: 95,
              column: 28
            },
            end: {
              line: 95,
              column: 29
            }
          },
          loc: {
            start: {
              line: 95,
              column: 33
            },
            end: {
              line: 95,
              column: 48
            }
          },
          line: 95
        },
        "12": {
          name: "(anonymous_12)",
          decl: {
            start: {
              line: 98,
              column: 4
            },
            end: {
              line: 98,
              column: 5
            }
          },
          loc: {
            start: {
              line: 98,
              column: 19
            },
            end: {
              line: 101,
              column: 5
            }
          },
          line: 98
        },
        "13": {
          name: "(anonymous_13)",
          decl: {
            start: {
              line: 99,
              column: 28
            },
            end: {
              line: 99,
              column: 29
            }
          },
          loc: {
            start: {
              line: 99,
              column: 33
            },
            end: {
              line: 99,
              column: 49
            }
          },
          line: 99
        }
      },
      branchMap: {
        "0": {
          loc: {
            start: {
              line: 15,
              column: 4
            },
            end: {
              line: 20,
              column: 5
            }
          },
          type: "if",
          locations: [{
            start: {
              line: 15,
              column: 4
            },
            end: {
              line: 20,
              column: 5
            }
          }, {
            start: {
              line: 15,
              column: 4
            },
            end: {
              line: 20,
              column: 5
            }
          }],
          line: 15
        },
        "1": {
          loc: {
            start: {
              line: 25,
              column: 4
            },
            end: {
              line: 25,
              column: 35
            }
          },
          type: "if",
          locations: [{
            start: {
              line: 25,
              column: 4
            },
            end: {
              line: 25,
              column: 35
            }
          }, {
            start: {
              line: 25,
              column: 4
            },
            end: {
              line: 25,
              column: 35
            }
          }],
          line: 25
        },
        "2": {
          loc: {
            start: {
              line: 31,
              column: 4
            },
            end: {
              line: 31,
              column: 35
            }
          },
          type: "if",
          locations: [{
            start: {
              line: 31,
              column: 4
            },
            end: {
              line: 31,
              column: 35
            }
          }, {
            start: {
              line: 31,
              column: 4
            },
            end: {
              line: 31,
              column: 35
            }
          }],
          line: 31
        },
        "3": {
          loc: {
            start: {
              line: 44,
              column: 2
            },
            end: {
              line: 47,
              column: 3
            }
          },
          type: "if",
          locations: [{
            start: {
              line: 44,
              column: 2
            },
            end: {
              line: 47,
              column: 3
            }
          }, {
            start: {
              line: 44,
              column: 2
            },
            end: {
              line: 47,
              column: 3
            }
          }],
          line: 44
        },
        "4": {
          loc: {
            start: {
              line: 49,
              column: 2
            },
            end: {
              line: 51,
              column: 3
            }
          },
          type: "if",
          locations: [{
            start: {
              line: 49,
              column: 2
            },
            end: {
              line: 51,
              column: 3
            }
          }, {
            start: {
              line: 49,
              column: 2
            },
            end: {
              line: 51,
              column: 3
            }
          }],
          line: 49
        },
        "5": {
          loc: {
            start: {
              line: 69,
              column: 14
            },
            end: {
              line: 72,
              column: 21
            }
          },
          type: "binary-expr",
          locations: [{
            start: {
              line: 69,
              column: 14
            },
            end: {
              line: 69,
              column: 26
            }
          }, {
            start: {
              line: 69,
              column: 30
            },
            end: {
              line: 72,
              column: 21
            }
          }],
          line: 69
        },
        "6": {
          loc: {
            start: {
              line: 85,
              column: 17
            },
            end: {
              line: 85,
              column: 56
            }
          },
          type: "binary-expr",
          locations: [{
            start: {
              line: 85,
              column: 17
            },
            end: {
              line: 85,
              column: 43
            }
          }, {
            start: {
              line: 85,
              column: 47
            },
            end: {
              line: 85,
              column: 56
            }
          }],
          line: 85
        }
      },
      s: {
        "0": 0,
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0,
        "6": 0,
        "7": 0,
        "8": 0,
        "9": 0,
        "10": 0,
        "11": 0,
        "12": 0,
        "13": 0,
        "14": 0,
        "15": 0,
        "16": 0,
        "17": 0,
        "18": 0,
        "19": 0,
        "20": 0,
        "21": 0,
        "22": 0,
        "23": 0,
        "24": 0,
        "25": 0,
        "26": 0,
        "27": 0,
        "28": 0,
        "29": 0,
        "30": 0,
        "31": 0,
        "32": 0,
        "33": 0,
        "34": 0,
        "35": 0
      },
      f: {
        "0": 0,
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0,
        "6": 0,
        "7": 0,
        "8": 0,
        "9": 0,
        "10": 0,
        "11": 0,
        "12": 0,
        "13": 0
      },
      b: {
        "0": [0, 0],
        "1": [0, 0],
        "2": [0, 0],
        "3": [0, 0],
        "4": [0, 0],
        "5": [0, 0],
        "6": [0, 0]
      },
      _coverageSchema: "43e27e138ebf9cfc5966b082cf9a028302ed4184"
    };
    var coverage = global[gcv] || (global[gcv] = {});

    if (coverage[path] && coverage[path].hash === hash) {
      return coverage[path];
    }

    coverageData.hash = hash;
    return coverage[path] = coverageData;
  }();
  /**
   * Binding responsible for the slots
   */

  var Slot = (cov_e4r0v40ck.s[0]++, Object.seal({
    // dynamic binding properties
    node: null,
    name: null,
    template: null,
    // API methods
    mount: function mount(scope) {
      cov_e4r0v40ck.f[0]++;
      cov_e4r0v40ck.s[1]++;

      if (!this.template) {
        cov_e4r0v40ck.b[0][0]++;
        cov_e4r0v40ck.s[2]++;
        this.node.parentNode.removeChild(this.node);
      } else {
        cov_e4r0v40ck.b[0][1]++;
        cov_e4r0v40ck.s[3]++;
        this.template.mount(this.node, scope);
        cov_e4r0v40ck.s[4]++;
        moveSlotInnerContent(this.node);
      }

      cov_e4r0v40ck.s[5]++;
      return this;
    },
    update: function update(scope) {
      cov_e4r0v40ck.f[1]++;
      cov_e4r0v40ck.s[6]++;

      if (!this.template) {
        cov_e4r0v40ck.b[1][0]++;
        cov_e4r0v40ck.s[7]++;
        return this;
      } else {
        cov_e4r0v40ck.b[1][1]++;
      }

      cov_e4r0v40ck.s[8]++;
      this.template.update(scope);
      cov_e4r0v40ck.s[9]++;
      return this;
    },
    unmount: function unmount(scope) {
      cov_e4r0v40ck.f[2]++;
      cov_e4r0v40ck.s[10]++;

      if (!this.template) {
        cov_e4r0v40ck.b[2][0]++;
        cov_e4r0v40ck.s[11]++;
        return this;
      } else {
        cov_e4r0v40ck.b[2][1]++;
      }

      cov_e4r0v40ck.s[12]++;
      this.template.unmount(scope);
      cov_e4r0v40ck.s[13]++;
      return this;
    }
  }));
  /**
   * Move the inner content of the slots outside of them
   * @param   {HTMLNode} slot - slot node
   * @returns {undefined} it's a void function
   */

  function moveSlotInnerContent(slot) {
    cov_e4r0v40ck.f[3]++;
    cov_e4r0v40ck.s[14]++;

    if (slot.firstChild) {
      cov_e4r0v40ck.b[3][0]++;
      cov_e4r0v40ck.s[15]++;
      slot.parentNode.insertBefore(slot.firstChild, slot);
      cov_e4r0v40ck.s[16]++;
      moveSlotInnerContent(slot);
    } else {
      cov_e4r0v40ck.b[3][1]++;
    }

    cov_e4r0v40ck.s[17]++;

    if (slot.parentNode) {
      cov_e4r0v40ck.b[4][0]++;
      cov_e4r0v40ck.s[18]++;
      slot.parentNode.removeChild(slot);
    } else {
      cov_e4r0v40ck.b[4][1]++;
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
    var name = _ref.name,
        slots = _ref.slots;
    cov_e4r0v40ck.f[4]++;
    var templateData = (cov_e4r0v40ck.s[19]++, slots.find(function (_ref2) {
      var id = _ref2.id;
      cov_e4r0v40ck.f[5]++;
      cov_e4r0v40ck.s[20]++;
      return id === name;
    }));
    cov_e4r0v40ck.s[21]++;
    return _objectSpread({}, Slot, {
      node: node,
      name: name,
      template: (cov_e4r0v40ck.b[5][0]++, templateData) && (cov_e4r0v40ck.b[5][1]++, create$6(templateData.html, templateData.bindings).createDOM(root))
    });
  }
  /**
   * Create the object that will manage the slots
   * @param   {HTMLElement} root - component root element
   * @param   {Array} slots - slots objects containing html and bindings
   * @return  {Object} tag like interface that will manage all the slots
   */


  function createSlots(root, slots) {
    cov_e4r0v40ck.f[6]++;
    var slotNodes = (cov_e4r0v40ck.s[22]++, $$('slot', root));
    var slotsBindings = (cov_e4r0v40ck.s[23]++, slotNodes.map(function (node) {
      cov_e4r0v40ck.f[7]++;
      var name = (cov_e4r0v40ck.s[24]++, (cov_e4r0v40ck.b[6][0]++, getAttribute(node, 'name')) || (cov_e4r0v40ck.b[6][1]++, 'default'));
      cov_e4r0v40ck.s[25]++;
      return createSlot(root, node, {
        name: name,
        slots: slots
      });
    }));
    cov_e4r0v40ck.s[26]++;
    return {
      mount: function mount(scope) {
        cov_e4r0v40ck.f[8]++;
        cov_e4r0v40ck.s[27]++;
        slotsBindings.forEach(function (s) {
          cov_e4r0v40ck.f[9]++;
          cov_e4r0v40ck.s[28]++;
          return s.mount(scope);
        });
        cov_e4r0v40ck.s[29]++;
        return this;
      },
      update: function update(scope) {
        cov_e4r0v40ck.f[10]++;
        cov_e4r0v40ck.s[30]++;
        slotsBindings.forEach(function (s) {
          cov_e4r0v40ck.f[11]++;
          cov_e4r0v40ck.s[31]++;
          return s.update(scope);
        });
        cov_e4r0v40ck.s[32]++;
        return this;
      },
      unmount: function unmount(scope) {
        cov_e4r0v40ck.f[12]++;
        cov_e4r0v40ck.s[33]++;
        slotsBindings.forEach(function (s) {
          cov_e4r0v40ck.f[13]++;
          cov_e4r0v40ck.s[34]++;
          return s.unmount(scope);
        });
        cov_e4r0v40ck.s[35]++;
        return this;
      }
    };
  }

  var cov_i93hzbber = function () {
    var path = "/Users/gianlucaguarini/Sites/riot/riot/src/core/css-manager.js";
    var hash = "5f096d2944e406f2ba853d27c924c5e3e73cb352";

    var Function = function () {}.constructor;

    var global = new Function("return this")();
    var gcv = "__coverage__";
    var coverageData = {
      path: "/Users/gianlucaguarini/Sites/riot/riot/src/core/css-manager.js",
      statementMap: {
        "0": {
          start: {
            line: 3,
            column: 12
          },
          end: {
            line: 3,
            column: 23
          }
        },
        "1": {
          start: {
            line: 4,
            column: 20
          },
          end: {
            line: 4,
            column: 29
          }
        },
        "2": {
          start: {
            line: 7,
            column: 18
          },
          end: {
            line: 14,
            column: 5
          }
        },
        "3": {
          start: {
            line: 9,
            column: 18
          },
          end: {
            line: 9,
            column: 49
          }
        },
        "4": {
          start: {
            line: 10,
            column: 2
          },
          end: {
            line: 10,
            column: 43
          }
        },
        "5": {
          start: {
            line: 11,
            column: 2
          },
          end: {
            line: 11,
            column: 36
          }
        },
        "6": {
          start: {
            line: 13,
            column: 2
          },
          end: {
            line: 13,
            column: 16
          }
        },
        "7": {
          start: {
            line: 27,
            column: 4
          },
          end: {
            line: 29,
            column: 5
          }
        },
        "8": {
          start: {
            line: 28,
            column: 6
          },
          end: {
            line: 28,
            column: 32
          }
        },
        "9": {
          start: {
            line: 31,
            column: 4
          },
          end: {
            line: 31,
            column: 17
          }
        },
        "10": {
          start: {
            line: 32,
            column: 4
          },
          end: {
            line: 32,
            column: 15
          }
        },
        "11": {
          start: {
            line: 43,
            column: 4
          },
          end: {
            line: 43,
            column: 62
          }
        },
        "12": {
          start: {
            line: 44,
            column: 4
          },
          end: {
            line: 44,
            column: 15
          }
        },
        "13": {
          start: {
            line: 56,
            column: 4
          },
          end: {
            line: 59,
            column: 5
          }
        },
        "14": {
          start: {
            line: 57,
            column: 6
          },
          end: {
            line: 57,
            column: 30
          }
        },
        "15": {
          start: {
            line: 58,
            column: 6
          },
          end: {
            line: 58,
            column: 19
          }
        },
        "16": {
          start: {
            line: 61,
            column: 4
          },
          end: {
            line: 61,
            column: 15
          }
        }
      },
      fnMap: {
        "0": {
          name: "(anonymous_0)",
          decl: {
            start: {
              line: 7,
              column: 27
            },
            end: {
              line: 7,
              column: 28
            }
          },
          loc: {
            start: {
              line: 7,
              column: 33
            },
            end: {
              line: 14,
              column: 1
            }
          },
          line: 7
        },
        "1": {
          name: "(anonymous_1)",
          decl: {
            start: {
              line: 26,
              column: 2
            },
            end: {
              line: 26,
              column: 3
            }
          },
          loc: {
            start: {
              line: 26,
              column: 17
            },
            end: {
              line: 33,
              column: 3
            }
          },
          line: 26
        },
        "2": {
          name: "(anonymous_2)",
          decl: {
            start: {
              line: 39,
              column: 2
            },
            end: {
              line: 39,
              column: 3
            }
          },
          loc: {
            start: {
              line: 39,
              column: 11
            },
            end: {
              line: 45,
              column: 3
            }
          },
          line: 39
        },
        "3": {
          name: "(anonymous_3)",
          decl: {
            start: {
              line: 52,
              column: 2
            },
            end: {
              line: 52,
              column: 3
            }
          },
          loc: {
            start: {
              line: 52,
              column: 15
            },
            end: {
              line: 62,
              column: 3
            }
          },
          line: 52
        }
      },
      branchMap: {
        "0": {
          loc: {
            start: {
              line: 7,
              column: 18
            },
            end: {
              line: 14,
              column: 5
            }
          },
          type: "binary-expr",
          locations: [{
            start: {
              line: 7,
              column: 18
            },
            end: {
              line: 7,
              column: 21
            }
          }, {
            start: {
              line: 7,
              column: 25
            },
            end: {
              line: 14,
              column: 5
            }
          }],
          line: 7
        },
        "1": {
          loc: {
            start: {
              line: 27,
              column: 4
            },
            end: {
              line: 29,
              column: 5
            }
          },
          type: "if",
          locations: [{
            start: {
              line: 27,
              column: 4
            },
            end: {
              line: 29,
              column: 5
            }
          }, {
            start: {
              line: 27,
              column: 4
            },
            end: {
              line: 29,
              column: 5
            }
          }],
          line: 27
        },
        "2": {
          loc: {
            start: {
              line: 56,
              column: 4
            },
            end: {
              line: 59,
              column: 5
            }
          },
          type: "if",
          locations: [{
            start: {
              line: 56,
              column: 4
            },
            end: {
              line: 59,
              column: 5
            }
          }, {
            start: {
              line: 56,
              column: 4
            },
            end: {
              line: 59,
              column: 5
            }
          }],
          line: 56
        }
      },
      s: {
        "0": 0,
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0,
        "6": 0,
        "7": 0,
        "8": 0,
        "9": 0,
        "10": 0,
        "11": 0,
        "12": 0,
        "13": 0,
        "14": 0,
        "15": 0,
        "16": 0
      },
      f: {
        "0": 0,
        "1": 0,
        "2": 0,
        "3": 0
      },
      b: {
        "0": [0, 0],
        "1": [0, 0],
        "2": [0, 0]
      },
      _coverageSchema: "43e27e138ebf9cfc5966b082cf9a028302ed4184"
    };
    var coverage = global[gcv] || (global[gcv] = {});

    if (coverage[path] && coverage[path].hash === hash) {
      return coverage[path];
    }

    coverageData.hash = hash;
    return coverage[path] = coverageData;
  }();
  var WIN = (cov_i93hzbber.s[0]++, getWindow());
  var CSS_BY_NAME = (cov_i93hzbber.s[1]++, new Map()); // skip the following code on the server

  var styleNode = (cov_i93hzbber.s[2]++, (cov_i93hzbber.b[0][0]++, WIN) && (cov_i93hzbber.b[0][1]++, function () {
    cov_i93hzbber.f[0]++;
    // create a new style element with the correct type
    var newNode = (cov_i93hzbber.s[3]++, document.createElement('style'));
    cov_i93hzbber.s[4]++;
    setAttribute(newNode, 'type', 'text/css');
    cov_i93hzbber.s[5]++;
    document.head.appendChild(newNode);
    cov_i93hzbber.s[6]++;
    return newNode;
  }()));
  /**
   * Object that will be used to inject and manage the css of every tag instance
   */

  var cssManager = {
    /**
     * Save a tag style to be later injected into DOM
     * @param { string } name - if it's passed we will map the css to a tagname
     * @param { string } css - css string
     * @returns {Object} self
     */
    add: function add(name, css) {
      cov_i93hzbber.f[1]++;
      cov_i93hzbber.s[7]++;

      if (!CSS_BY_NAME.has(name)) {
        cov_i93hzbber.b[1][0]++;
        cov_i93hzbber.s[8]++;
        CSS_BY_NAME.set(name, css);
      } else {
        cov_i93hzbber.b[1][1]++;
      }

      cov_i93hzbber.s[9]++;
      this.inject();
      cov_i93hzbber.s[10]++;
      return this;
    },

    /**
     * Inject all previously saved tag styles into DOM
     * innerHTML seems slow: http://jsperf.com/riot-insert-style
     * @returns {Object} self
     */
    inject: function inject() {
      cov_i93hzbber.f[2]++;
      // a node environment can't rely on css

      /* istanbul ignore next */
      if (!styleNode) return this;
      cov_i93hzbber.s[11]++;
      styleNode.innerHTML = _toConsumableArray(CSS_BY_NAME.values()).join('\n');
      cov_i93hzbber.s[12]++;
      return this;
    },

    /**
     * Remove a tag style from the DOM
     * @param {string} name a registered tagname
     * @returns {Object} self
     */
    remove: function remove(name) {
      cov_i93hzbber.f[3]++;
      // a node environment can't rely on css

      /* istanbul ignore next */
      if (!styleNode) return this;
      cov_i93hzbber.s[13]++;

      if (CSS_BY_NAME.has(name)) {
        cov_i93hzbber.b[2][0]++;
        cov_i93hzbber.s[14]++;
        CSS_BY_NAME.delete(name);
        cov_i93hzbber.s[15]++;
        this.inject();
      } else {
        cov_i93hzbber.b[2][1]++;
      }

      cov_i93hzbber.s[16]++;
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
  function curry(fn, ...acc) {
    return (...args) => {
      args = [...acc, ...args];

      return args.length < fn.length ?
        curry(fn, ...args) :
        fn(...args)
    }
  }

  var cov_13wuvjnnig = function () {
    var path = "/Users/gianlucaguarini/Sites/riot/riot/src/core/component.js";
    var hash = "4078628c72dbb0b6589679f839ac4e3ad493a301";

    var Function = function () {}.constructor;

    var global = new Function("return this")();
    var gcv = "__coverage__";
    var coverageData = {
      path: "/Users/gianlucaguarini/Sites/riot/riot/src/core/component.js",
      statementMap: {
        "0": {
          start: {
            line: 23,
            column: 31
          },
          end: {
            line: 28,
            column: 2
          }
        },
        "1": {
          start: {
            line: 25,
            column: 15
          },
          end: {
            line: 25,
            column: 44
          }
        },
        "2": {
          start: {
            line: 26,
            column: 16
          },
          end: {
            line: 26,
            column: 46
          }
        },
        "3": {
          start: {
            line: 27,
            column: 17
          },
          end: {
            line: 27,
            column: 100
          }
        },
        "4": {
          start: {
            line: 27,
            column: 58
          },
          end: {
            line: 27,
            column: 99
          }
        },
        "5": {
          start: {
            line: 30,
            column: 36
          },
          end: {
            line: 38,
            column: 2
          }
        },
        "6": {
          start: {
            line: 40,
            column: 34
          },
          end: {
            line: 46,
            column: 1
          }
        },
        "7": {
          start: {
            line: 57,
            column: 2
          },
          end: {
            line: 76,
            column: 3
          }
        },
        "8": {
          start: {
            line: 58,
            column: 22
          },
          end: {
            line: 63,
            column: 26
          }
        },
        "9": {
          start: {
            line: 65,
            column: 4
          },
          end: {
            line: 75,
            column: 5
          }
        },
        "10": {
          start: {
            line: 67,
            column: 8
          },
          end: {
            line: 67,
            column: 59
          }
        },
        "11": {
          start: {
            line: 70,
            column: 8
          },
          end: {
            line: 70,
            column: 51
          }
        },
        "12": {
          start: {
            line: 73,
            column: 8
          },
          end: {
            line: 73,
            column: 34
          }
        },
        "13": {
          start: {
            line: 86,
            column: 23
          },
          end: {
            line: 86,
            column: 46
          }
        },
        "14": {
          start: {
            line: 87,
            column: 21
          },
          end: {
            line: 87,
            column: 65
          }
        },
        "15": {
          start: {
            line: 90,
            column: 2
          },
          end: {
            line: 90,
            column: 44
          }
        },
        "16": {
          start: {
            line: 90,
            column: 19
          },
          end: {
            line: 90,
            column: 44
          }
        },
        "17": {
          start: {
            line: 92,
            column: 2
          },
          end: {
            line: 113,
            column: 3
          }
        },
        "18": {
          start: {
            line: 109,
            column: 10
          },
          end: {
            line: 109,
            column: 76
          }
        },
        "19": {
          start: {
            line: 125,
            column: 2
          },
          end: {
            line: 127,
            column: 3
          }
        },
        "20": {
          start: {
            line: 126,
            column: 4
          },
          end: {
            line: 126,
            column: 91
          }
        },
        "21": {
          start: {
            line: 129,
            column: 2
          },
          end: {
            line: 129,
            column: 31
          }
        },
        "22": {
          start: {
            line: 138,
            column: 2
          },
          end: {
            line: 145,
            column: 5
          }
        },
        "23": {
          start: {
            line: 140,
            column: 6
          },
          end: {
            line: 143,
            column: 7
          }
        },
        "24": {
          start: {
            line: 154,
            column: 2
          },
          end: {
            line: 158,
            column: 10
          }
        },
        "25": {
          start: {
            line: 156,
            column: 6
          },
          end: {
            line: 156,
            column: 57
          }
        },
        "26": {
          start: {
            line: 157,
            column: 6
          },
          end: {
            line: 157,
            column: 16
          }
        },
        "27": {
          start: {
            line: 167,
            column: 2
          },
          end: {
            line: 167,
            column: 66
          }
        },
        "28": {
          start: {
            line: 167,
            column: 44
          },
          end: {
            line: 167,
            column: 54
          }
        },
        "29": {
          start: {
            line: 178,
            column: 28
          },
          end: {
            line: 178,
            column: 63
          }
        },
        "30": {
          start: {
            line: 180,
            column: 2
          },
          end: {
            line: 249,
            column: 3
          }
        },
        "31": {
          start: {
            line: 184,
            column: 10
          },
          end: {
            line: 184,
            column: 74
          }
        },
        "32": {
          start: {
            line: 186,
            column: 10
          },
          end: {
            line: 189,
            column: 11
          }
        },
        "33": {
          start: {
            line: 191,
            column: 10
          },
          end: {
            line: 195,
            column: 12
          }
        },
        "34": {
          start: {
            line: 198,
            column: 10
          },
          end: {
            line: 198,
            column: 57
          }
        },
        "35": {
          start: {
            line: 200,
            column: 10
          },
          end: {
            line: 200,
            column: 30
          }
        },
        "36": {
          start: {
            line: 203,
            column: 10
          },
          end: {
            line: 203,
            column: 53
          }
        },
        "37": {
          start: {
            line: 204,
            column: 10
          },
          end: {
            line: 204,
            column: 44
          }
        },
        "38": {
          start: {
            line: 207,
            column: 10
          },
          end: {
            line: 207,
            column: 74
          }
        },
        "39": {
          start: {
            line: 208,
            column: 10
          },
          end: {
            line: 208,
            column: 39
          }
        },
        "40": {
          start: {
            line: 210,
            column: 10
          },
          end: {
            line: 210,
            column: 26
          }
        },
        "41": {
          start: {
            line: 212,
            column: 10
          },
          end: {
            line: 212,
            column: 21
          }
        },
        "42": {
          start: {
            line: 215,
            column: 27
          },
          end: {
            line: 215,
            column: 88
          }
        },
        "43": {
          start: {
            line: 217,
            column: 10
          },
          end: {
            line: 217,
            column: 66
          }
        },
        "44": {
          start: {
            line: 217,
            column: 60
          },
          end: {
            line: 217,
            column: 66
          }
        },
        "45": {
          start: {
            line: 219,
            column: 10
          },
          end: {
            line: 219,
            column: 31
          }
        },
        "46": {
          start: {
            line: 220,
            column: 10
          },
          end: {
            line: 220,
            column: 31
          }
        },
        "47": {
          start: {
            line: 222,
            column: 10
          },
          end: {
            line: 225,
            column: 11
          }
        },
        "48": {
          start: {
            line: 227,
            column: 10
          },
          end: {
            line: 230,
            column: 11
          }
        },
        "49": {
          start: {
            line: 228,
            column: 12
          },
          end: {
            line: 228,
            column: 47
          }
        },
        "50": {
          start: {
            line: 229,
            column: 12
          },
          end: {
            line: 229,
            column: 42
          }
        },
        "51": {
          start: {
            line: 232,
            column: 10
          },
          end: {
            line: 232,
            column: 36
          }
        },
        "52": {
          start: {
            line: 233,
            column: 10
          },
          end: {
            line: 233,
            column: 26
          }
        },
        "53": {
          start: {
            line: 235,
            column: 10
          },
          end: {
            line: 235,
            column: 21
          }
        },
        "54": {
          start: {
            line: 238,
            column: 10
          },
          end: {
            line: 238,
            column: 32
          }
        },
        "55": {
          start: {
            line: 239,
            column: 10
          },
          end: {
            line: 239,
            column: 35
          }
        },
        "56": {
          start: {
            line: 240,
            column: 10
          },
          end: {
            line: 240,
            column: 30
          }
        },
        "57": {
          start: {
            line: 241,
            column: 10
          },
          end: {
            line: 241,
            column: 58
          }
        },
        "58": {
          start: {
            line: 242,
            column: 10
          },
          end: {
            line: 242,
            column: 28
          }
        },
        "59": {
          start: {
            line: 244,
            column: 10
          },
          end: {
            line: 244,
            column: 21
          }
        },
        "60": {
          start: {
            line: 248,
            column: 42
          },
          end: {
            line: 248,
            column: 69
          }
        },
        "61": {
          start: {
            line: 260,
            column: 15
          },
          end: {
            line: 260,
            column: 48
          }
        },
        "62": {
          start: {
            line: 261,
            column: 2
          },
          end: {
            line: 261,
            column: 107
          }
        },
        "63": {
          start: {
            line: 261,
            column: 48
          },
          end: {
            line: 261,
            column: 107
          }
        },
        "64": {
          start: {
            line: 263,
            column: 20
          },
          end: {
            line: 263,
            column: 63
          }
        },
        "65": {
          start: {
            line: 265,
            column: 2
          },
          end: {
            line: 265,
            column: 51
          }
        }
      },
      fnMap: {
        "0": {
          name: "(anonymous_0)",
          decl: {
            start: {
              line: 25,
              column: 2
            },
            end: {
              line: 25,
              column: 3
            }
          },
          loc: {
            start: {
              line: 25,
              column: 13
            },
            end: {
              line: 25,
              column: 46
            }
          },
          line: 25
        },
        "1": {
          name: "(anonymous_1)",
          decl: {
            start: {
              line: 26,
              column: 2
            },
            end: {
              line: 26,
              column: 3
            }
          },
          loc: {
            start: {
              line: 26,
              column: 14
            },
            end: {
              line: 26,
              column: 48
            }
          },
          line: 26
        },
        "2": {
          name: "(anonymous_2)",
          decl: {
            start: {
              line: 27,
              column: 2
            },
            end: {
              line: 27,
              column: 3
            }
          },
          loc: {
            start: {
              line: 27,
              column: 15
            },
            end: {
              line: 27,
              column: 101
            }
          },
          line: 27
        },
        "3": {
          name: "(anonymous_3)",
          decl: {
            start: {
              line: 27,
              column: 52
            },
            end: {
              line: 27,
              column: 53
            }
          },
          loc: {
            start: {
              line: 27,
              column: 58
            },
            end: {
              line: 27,
              column: 99
            }
          },
          line: 27
        },
        "4": {
          name: "createComponent",
          decl: {
            start: {
              line: 56,
              column: 16
            },
            end: {
              line: 56,
              column: 31
            }
          },
          loc: {
            start: {
              line: 56,
              column: 60
            },
            end: {
              line: 77,
              column: 1
            }
          },
          line: 56
        },
        "5": {
          name: "(anonymous_5)",
          decl: {
            start: {
              line: 57,
              column: 9
            },
            end: {
              line: 57,
              column: 10
            }
          },
          loc: {
            start: {
              line: 57,
              column: 31
            },
            end: {
              line: 76,
              column: 3
            }
          },
          line: 57
        },
        "6": {
          name: "(anonymous_6)",
          decl: {
            start: {
              line: 66,
              column: 6
            },
            end: {
              line: 66,
              column: 7
            }
          },
          loc: {
            start: {
              line: 66,
              column: 41
            },
            end: {
              line: 68,
              column: 7
            }
          },
          line: 66
        },
        "7": {
          name: "(anonymous_7)",
          decl: {
            start: {
              line: 69,
              column: 6
            },
            end: {
              line: 69,
              column: 7
            }
          },
          loc: {
            start: {
              line: 69,
              column: 33
            },
            end: {
              line: 71,
              column: 7
            }
          },
          line: 69
        },
        "8": {
          name: "(anonymous_8)",
          decl: {
            start: {
              line: 72,
              column: 6
            },
            end: {
              line: 72,
              column: 7
            }
          },
          loc: {
            start: {
              line: 72,
              column: 16
            },
            end: {
              line: 74,
              column: 7
            }
          },
          line: 72
        },
        "9": {
          name: "defineComponent",
          decl: {
            start: {
              line: 85,
              column: 16
            },
            end: {
              line: 85,
              column: 31
            }
          },
          loc: {
            start: {
              line: 85,
              column: 60
            },
            end: {
              line: 114,
              column: 1
            }
          },
          line: 85
        },
        "10": {
          name: "(anonymous_10)",
          decl: {
            start: {
              line: 108,
              column: 8
            },
            end: {
              line: 108,
              column: 9
            }
          },
          loc: {
            start: {
              line: 108,
              column: 16
            },
            end: {
              line: 110,
              column: 9
            }
          },
          line: 108
        },
        "11": {
          name: "evaluateProps",
          decl: {
            start: {
              line: 124,
              column: 9
            },
            end: {
              line: 124,
              column: 22
            }
          },
          loc: {
            start: {
              line: 124,
              column: 80
            },
            end: {
              line: 130,
              column: 1
            }
          },
          line: 124
        },
        "12": {
          name: "createAttributeBindings",
          decl: {
            start: {
              line: 137,
              column: 9
            },
            end: {
              line: 137,
              column: 32
            }
          },
          loc: {
            start: {
              line: 137,
              column: 45
            },
            end: {
              line: 146,
              column: 1
            }
          },
          line: 137
        },
        "13": {
          name: "(anonymous_13)",
          decl: {
            start: {
              line: 139,
              column: 40
            },
            end: {
              line: 139,
              column: 41
            }
          },
          loc: {
            start: {
              line: 139,
              column: 48
            },
            end: {
              line: 144,
              column: 5
            }
          },
          line: 139
        },
        "14": {
          name: "createSubcomponents",
          decl: {
            start: {
              line: 153,
              column: 9
            },
            end: {
              line: 153,
              column: 28
            }
          },
          loc: {
            start: {
              line: 153,
              column: 46
            },
            end: {
              line: 159,
              column: 1
            }
          },
          line: 153
        },
        "15": {
          name: "(anonymous_15)",
          decl: {
            start: {
              line: 155,
              column: 12
            },
            end: {
              line: 155,
              column: 13
            }
          },
          loc: {
            start: {
              line: 155,
              column: 35
            },
            end: {
              line: 158,
              column: 5
            }
          },
          line: 155
        },
        "16": {
          name: "runPlugins",
          decl: {
            start: {
              line: 166,
              column: 9
            },
            end: {
              line: 166,
              column: 19
            }
          },
          loc: {
            start: {
              line: 166,
              column: 31
            },
            end: {
              line: 168,
              column: 1
            }
          },
          line: 166
        },
        "17": {
          name: "(anonymous_17)",
          decl: {
            start: {
              line: 167,
              column: 33
            },
            end: {
              line: 167,
              column: 34
            }
          },
          loc: {
            start: {
              line: 167,
              column: 44
            },
            end: {
              line: 167,
              column: 54
            }
          },
          line: 167
        },
        "18": {
          name: "enhanceComponentAPI",
          decl: {
            start: {
              line: 177,
              column: 16
            },
            end: {
              line: 177,
              column: 35
            }
          },
          loc: {
            start: {
              line: 177,
              column: 68
            },
            end: {
              line: 250,
              column: 1
            }
          },
          line: 177
        },
        "19": {
          name: "(anonymous_19)",
          decl: {
            start: {
              line: 183,
              column: 8
            },
            end: {
              line: 183,
              column: 9
            }
          },
          loc: {
            start: {
              line: 183,
              column: 48
            },
            end: {
              line: 213,
              column: 9
            }
          },
          line: 183
        },
        "20": {
          name: "(anonymous_20)",
          decl: {
            start: {
              line: 214,
              column: 8
            },
            end: {
              line: 214,
              column: 9
            }
          },
          loc: {
            start: {
              line: 214,
              column: 40
            },
            end: {
              line: 236,
              column: 9
            }
          },
          line: 214
        },
        "21": {
          name: "(anonymous_21)",
          decl: {
            start: {
              line: 237,
              column: 8
            },
            end: {
              line: 237,
              column: 9
            }
          },
          loc: {
            start: {
              line: 237,
              column: 28
            },
            end: {
              line: 245,
              column: 9
            }
          },
          line: 237
        },
        "22": {
          name: "(anonymous_22)",
          decl: {
            start: {
              line: 248,
              column: 34
            },
            end: {
              line: 248,
              column: 35
            }
          },
          loc: {
            start: {
              line: 248,
              column: 42
            },
            end: {
              line: 248,
              column: 69
            }
          },
          line: 248
        },
        "23": {
          name: "mountComponent",
          decl: {
            start: {
              line: 259,
              column: 16
            },
            end: {
              line: 259,
              column: 30
            }
          },
          loc: {
            start: {
              line: 259,
              column: 69
            },
            end: {
              line: 266,
              column: 1
            }
          },
          line: 259
        }
      },
      branchMap: {
        "0": {
          loc: {
            start: {
              line: 27,
              column: 58
            },
            end: {
              line: 27,
              column: 99
            }
          },
          type: "binary-expr",
          locations: [{
            start: {
              line: 27,
              column: 58
            },
            end: {
              line: 27,
              column: 93
            }
          }, {
            start: {
              line: 27,
              column: 97
            },
            end: {
              line: 27,
              column: 99
            }
          }],
          line: 27
        },
        "1": {
          loc: {
            start: {
              line: 86,
              column: 23
            },
            end: {
              line: 86,
              column: 46
            }
          },
          type: "binary-expr",
          locations: [{
            start: {
              line: 86,
              column: 23
            },
            end: {
              line: 86,
              column: 40
            }
          }, {
            start: {
              line: 86,
              column: 44
            },
            end: {
              line: 86,
              column: 46
            }
          }],
          line: 86
        },
        "2": {
          loc: {
            start: {
              line: 90,
              column: 2
            },
            end: {
              line: 90,
              column: 44
            }
          },
          type: "if",
          locations: [{
            start: {
              line: 90,
              column: 2
            },
            end: {
              line: 90,
              column: 44
            }
          }, {
            start: {
              line: 90,
              column: 2
            },
            end: {
              line: 90,
              column: 44
            }
          }],
          line: 90
        },
        "3": {
          loc: {
            start: {
              line: 90,
              column: 6
            },
            end: {
              line: 90,
              column: 17
            }
          },
          type: "binary-expr",
          locations: [{
            start: {
              line: 90,
              column: 6
            },
            end: {
              line: 90,
              column: 9
            }
          }, {
            start: {
              line: 90,
              column: 13
            },
            end: {
              line: 90,
              column: 17
            }
          }],
          line: 90
        },
        "4": {
          loc: {
            start: {
              line: 104,
              column: 16
            },
            end: {
              line: 111,
              column: 35
            }
          },
          type: "cond-expr",
          locations: [{
            start: {
              line: 104,
              column: 27
            },
            end: {
              line: 111,
              column: 7
            }
          }, {
            start: {
              line: 111,
              column: 10
            },
            end: {
              line: 111,
              column: 35
            }
          }],
          line: 104
        },
        "5": {
          loc: {
            start: {
              line: 109,
              column: 17
            },
            end: {
              line: 109,
              column: 76
            }
          },
          type: "binary-expr",
          locations: [{
            start: {
              line: 109,
              column: 17
            },
            end: {
              line: 109,
              column: 33
            }
          }, {
            start: {
              line: 109,
              column: 37
            },
            end: {
              line: 109,
              column: 76
            }
          }],
          line: 109
        },
        "6": {
          loc: {
            start: {
              line: 124,
              column: 32
            },
            end: {
              line: 124,
              column: 57
            }
          },
          type: "default-arg",
          locations: [{
            start: {
              line: 124,
              column: 55
            },
            end: {
              line: 124,
              column: 57
            }
          }],
          line: 124
        },
        "7": {
          loc: {
            start: {
              line: 125,
              column: 2
            },
            end: {
              line: 127,
              column: 3
            }
          },
          type: "if",
          locations: [{
            start: {
              line: 125,
              column: 2
            },
            end: {
              line: 127,
              column: 3
            }
          }, {
            start: {
              line: 125,
              column: 2
            },
            end: {
              line: 127,
              column: 3
            }
          }],
          line: 125
        },
        "8": {
          loc: {
            start: {
              line: 126,
              column: 11
            },
            end: {
              line: 126,
              column: 91
            }
          },
          type: "cond-expr",
          locations: [{
            start: {
              line: 126,
              column: 19
            },
            end: {
              line: 126,
              column: 76
            }
          }, {
            start: {
              line: 126,
              column: 79
            },
            end: {
              line: 126,
              column: 91
            }
          }],
          line: 126
        },
        "9": {
          loc: {
            start: {
              line: 139,
              column: 18
            },
            end: {
              line: 139,
              column: 34
            }
          },
          type: "binary-expr",
          locations: [{
            start: {
              line: 139,
              column: 18
            },
            end: {
              line: 139,
              column: 28
            }
          }, {
            start: {
              line: 139,
              column: 32
            },
            end: {
              line: 139,
              column: 34
            }
          }],
          line: 139
        },
        "10": {
          loc: {
            start: {
              line: 153,
              column: 29
            },
            end: {
              line: 153,
              column: 44
            }
          },
          type: "default-arg",
          locations: [{
            start: {
              line: 153,
              column: 42
            },
            end: {
              line: 153,
              column: 44
            }
          }],
          line: 153
        },
        "11": {
          loc: {
            start: {
              line: 167,
              column: 44
            },
            end: {
              line: 167,
              column: 54
            }
          },
          type: "binary-expr",
          locations: [{
            start: {
              line: 167,
              column: 44
            },
            end: {
              line: 167,
              column: 49
            }
          }, {
            start: {
              line: 167,
              column: 53
            },
            end: {
              line: 167,
              column: 54
            }
          }],
          line: 167
        },
        "12": {
          loc: {
            start: {
              line: 183,
              column: 23
            },
            end: {
              line: 183,
              column: 33
            }
          },
          type: "default-arg",
          locations: [{
            start: {
              line: 183,
              column: 31
            },
            end: {
              line: 183,
              column: 33
            }
          }],
          line: 183
        },
        "13": {
          loc: {
            start: {
              line: 207,
              column: 61
            },
            end: {
              line: 207,
              column: 72
            }
          },
          type: "binary-expr",
          locations: [{
            start: {
              line: 207,
              column: 61
            },
            end: {
              line: 207,
              column: 66
            }
          }, {
            start: {
              line: 207,
              column: 70
            },
            end: {
              line: 207,
              column: 72
            }
          }],
          line: 207
        },
        "14": {
          loc: {
            start: {
              line: 214,
              column: 15
            },
            end: {
              line: 214,
              column: 25
            }
          },
          type: "default-arg",
          locations: [{
            start: {
              line: 214,
              column: 23
            },
            end: {
              line: 214,
              column: 25
            }
          }],
          line: 214
        },
        "15": {
          loc: {
            start: {
              line: 217,
              column: 10
            },
            end: {
              line: 217,
              column: 66
            }
          },
          type: "if",
          locations: [{
            start: {
              line: 217,
              column: 10
            },
            end: {
              line: 217,
              column: 66
            }
          }, {
            start: {
              line: 217,
              column: 10
            },
            end: {
              line: 217,
              column: 66
            }
          }],
          line: 217
        },
        "16": {
          loc: {
            start: {
              line: 227,
              column: 10
            },
            end: {
              line: 230,
              column: 11
            }
          },
          type: "if",
          locations: [{
            start: {
              line: 227,
              column: 10
            },
            end: {
              line: 230,
              column: 11
            }
          }, {
            start: {
              line: 227,
              column: 10
            },
            end: {
              line: 230,
              column: 11
            }
          }],
          line: 227
        },
        "17": {
          loc: {
            start: {
              line: 260,
              column: 15
            },
            end: {
              line: 260,
              column: 48
            }
          },
          type: "binary-expr",
          locations: [{
            start: {
              line: 260,
              column: 15
            },
            end: {
              line: 260,
              column: 28
            }
          }, {
            start: {
              line: 260,
              column: 32
            },
            end: {
              line: 260,
              column: 48
            }
          }],
          line: 260
        },
        "18": {
          loc: {
            start: {
              line: 261,
              column: 2
            },
            end: {
              line: 261,
              column: 107
            }
          },
          type: "if",
          locations: [{
            start: {
              line: 261,
              column: 2
            },
            end: {
              line: 261,
              column: 107
            }
          }, {
            start: {
              line: 261,
              column: 2
            },
            end: {
              line: 261,
              column: 107
            }
          }],
          line: 261
        }
      },
      s: {
        "0": 0,
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0,
        "6": 0,
        "7": 0,
        "8": 0,
        "9": 0,
        "10": 0,
        "11": 0,
        "12": 0,
        "13": 0,
        "14": 0,
        "15": 0,
        "16": 0,
        "17": 0,
        "18": 0,
        "19": 0,
        "20": 0,
        "21": 0,
        "22": 0,
        "23": 0,
        "24": 0,
        "25": 0,
        "26": 0,
        "27": 0,
        "28": 0,
        "29": 0,
        "30": 0,
        "31": 0,
        "32": 0,
        "33": 0,
        "34": 0,
        "35": 0,
        "36": 0,
        "37": 0,
        "38": 0,
        "39": 0,
        "40": 0,
        "41": 0,
        "42": 0,
        "43": 0,
        "44": 0,
        "45": 0,
        "46": 0,
        "47": 0,
        "48": 0,
        "49": 0,
        "50": 0,
        "51": 0,
        "52": 0,
        "53": 0,
        "54": 0,
        "55": 0,
        "56": 0,
        "57": 0,
        "58": 0,
        "59": 0,
        "60": 0,
        "61": 0,
        "62": 0,
        "63": 0,
        "64": 0,
        "65": 0
      },
      f: {
        "0": 0,
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0,
        "6": 0,
        "7": 0,
        "8": 0,
        "9": 0,
        "10": 0,
        "11": 0,
        "12": 0,
        "13": 0,
        "14": 0,
        "15": 0,
        "16": 0,
        "17": 0,
        "18": 0,
        "19": 0,
        "20": 0,
        "21": 0,
        "22": 0,
        "23": 0
      },
      b: {
        "0": [0, 0],
        "1": [0, 0],
        "2": [0, 0],
        "3": [0, 0],
        "4": [0, 0],
        "5": [0, 0],
        "6": [0],
        "7": [0, 0],
        "8": [0, 0],
        "9": [0, 0],
        "10": [0],
        "11": [0, 0],
        "12": [0],
        "13": [0, 0],
        "14": [0],
        "15": [0, 0],
        "16": [0, 0],
        "17": [0, 0],
        "18": [0, 0]
      },
      _coverageSchema: "43e27e138ebf9cfc5966b082cf9a028302ed4184"
    };
    var coverage = global[gcv] || (global[gcv] = {});

    if (coverage[path] && coverage[path].hash === hash) {
      return coverage[path];
    }

    coverageData.hash = hash;
    return coverage[path] = coverageData;
  }();
  var COMPONENT_CORE_HELPERS = (cov_13wuvjnnig.s[0]++, Object.freeze({
    // component helpers
    $: function $$$1(selector) {
      cov_13wuvjnnig.f[0]++;
      cov_13wuvjnnig.s[1]++;
      return $(selector, this.root);
    },
    $$: function $$$$1(selector) {
      cov_13wuvjnnig.f[1]++;
      cov_13wuvjnnig.s[2]++;
      return $$(selector, this.root);
    },
    ref: function ref(selector) {
      cov_13wuvjnnig.f[2]++;
      cov_13wuvjnnig.s[3]++;
      return $$(selector, this.root).map(function (el) {
        cov_13wuvjnnig.f[3]++;
        cov_13wuvjnnig.s[4]++;
        return (cov_13wuvjnnig.b[0][0]++, el[DOM_COMPONENT_INSTANCE_PROPERTY]) || (cov_13wuvjnnig.b[0][1]++, el);
      });
    }
  }));
  var COMPONENT_LIFECYCLE_METHODS = (cov_13wuvjnnig.s[5]++, Object.freeze({
    shouldUpdate: noop,
    onBeforeMount: noop,
    onMounted: noop,
    onBeforeUpdate: noop,
    onUpdated: noop,
    onBeforeUnmount: noop,
    onUnmounted: noop
  }));
  var MOCKED_TEMPLATE_INTERFACE = (cov_13wuvjnnig.s[6]++, {
    update: noop,
    mount: noop,
    unmount: noop,
    clone: noop,
    createDOM: noop
    /**
     * Create the component interface needed for the compiled components
     * @param   {string} options.css - component css
     * @param   {Function} options.template - functon that will return the dom-bindings template function
     * @param   {Object} options.tag - component interface
     * @param   {string} options.name - component name
     * @returns {Object} component like interface
     */

  });
  function createComponent(_ref) {
    var css = _ref.css,
        template$$1 = _ref.template,
        tag = _ref.tag,
        name = _ref.name;
    cov_13wuvjnnig.f[4]++;
    cov_13wuvjnnig.s[7]++;
    return function (slotsAndAttributes) {
      cov_13wuvjnnig.f[5]++;
      var component = (cov_13wuvjnnig.s[8]++, defineComponent({
        css: css,
        template: template$$1,
        tag: tag,
        name: name
      })(slotsAndAttributes));
      cov_13wuvjnnig.s[9]++;
      return {
        mount: function mount(element, parentScope, state) {
          cov_13wuvjnnig.f[6]++;
          cov_13wuvjnnig.s[10]++;
          return component.mount(element, state, parentScope);
        },
        update: function update(parentScope, state) {
          cov_13wuvjnnig.f[7]++;
          cov_13wuvjnnig.s[11]++;
          return component.update(state, parentScope);
        },
        unmount: function unmount() {
          cov_13wuvjnnig.f[8]++;
          cov_13wuvjnnig.s[12]++;
          return component.unmount();
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

  function defineComponent(_ref2) {
    var css = _ref2.css,
        template$$1 = _ref2.template,
        tag = _ref2.tag,
        name = _ref2.name;
    cov_13wuvjnnig.f[9]++;
    var componentAPI = (cov_13wuvjnnig.s[13]++, (cov_13wuvjnnig.b[1][0]++, callOrAssign(tag)) || (cov_13wuvjnnig.b[1][1]++, {}));
    var components = (cov_13wuvjnnig.s[14]++, createSubcomponents(componentAPI.components)); // add the component css into the DOM

    cov_13wuvjnnig.s[15]++;

    if ((cov_13wuvjnnig.b[3][0]++, css) && (cov_13wuvjnnig.b[3][1]++, name)) {
      cov_13wuvjnnig.b[2][0]++;
      cov_13wuvjnnig.s[16]++;
      cssManager.add(name, css);
    } else {
      cov_13wuvjnnig.b[2][1]++;
    }

    cov_13wuvjnnig.s[17]++;
    return curry(enhanceComponentAPI)(defineProperties( // set the component defaults without overriding the original component API
    defineDefaults(componentAPI, _objectSpread({}, COMPONENT_LIFECYCLE_METHODS, {
      state: {}
    })), _objectSpread({
      // defined during the component creation
      slots: null,
      root: null
    }, COMPONENT_CORE_HELPERS, {
      css: css,
      template: template$$1 ? (cov_13wuvjnnig.b[4][0]++, template$$1(create$6, expressionTypes, bindingTypes, function (name) {
        cov_13wuvjnnig.f[10]++;
        cov_13wuvjnnig.s[18]++;
        return (cov_13wuvjnnig.b[5][0]++, components[name]) || (cov_13wuvjnnig.b[5][1]++, COMPONENTS_IMPLEMENTATION_MAP.get(name));
      })) : (cov_13wuvjnnig.b[4][1]++, MOCKED_TEMPLATE_INTERFACE)
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

  function evaluateProps(element) {
    var attributeExpressions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : (cov_13wuvjnnig.b[6][0]++, []);
    var scope = arguments.length > 2 ? arguments[2] : undefined;
    var currentProps = arguments.length > 3 ? arguments[3] : undefined;
    cov_13wuvjnnig.f[11]++;
    cov_13wuvjnnig.s[19]++;

    if (attributeExpressions.length) {
      cov_13wuvjnnig.b[7][0]++;
      cov_13wuvjnnig.s[20]++;
      return scope ? (cov_13wuvjnnig.b[8][0]++, evaluateAttributeExpressions(attributeExpressions, scope)) : (cov_13wuvjnnig.b[8][1]++, currentProps);
    } else {
      cov_13wuvjnnig.b[7][1]++;
    }

    cov_13wuvjnnig.s[21]++;
    return getAttributes(element);
  }
  /**
   * Create the bindings to update the component attributes
   * @param   {Array} attributes - list of attribute bindings
   * @returns {TemplateChunk} - template bindings object
   */


  function createAttributeBindings(attributes) {
    cov_13wuvjnnig.f[12]++;
    cov_13wuvjnnig.s[22]++;
    return create$6(null, [{
      expressions: ((cov_13wuvjnnig.b[9][0]++, attributes) || (cov_13wuvjnnig.b[9][1]++, [])).map(function (attr) {
        cov_13wuvjnnig.f[13]++;
        cov_13wuvjnnig.s[23]++;
        return _objectSpread({
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


  function createSubcomponents() {
    var components = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : (cov_13wuvjnnig.b[10][0]++, {});
    cov_13wuvjnnig.f[14]++;
    cov_13wuvjnnig.s[24]++;
    return Object.entries(callOrAssign(components)).reduce(function (acc, _ref3) {
      var _ref4 = _slicedToArray(_ref3, 2),
          key = _ref4[0],
          value = _ref4[1];

      cov_13wuvjnnig.f[15]++;
      cov_13wuvjnnig.s[25]++;
      acc[key] = createComponent(_objectSpread({
        name: key
      }, value));
      cov_13wuvjnnig.s[26]++;
      return acc;
    }, {});
  }
  /**
   * Run the component instance through all the plugins set by the user
   * @param   {Object} component - component instance
   * @returns {Object} the component enhanced by the plugins
   */


  function runPlugins(component) {
    cov_13wuvjnnig.f[16]++;
    cov_13wuvjnnig.s[27]++;
    return _toConsumableArray(PLUGINS_SET).reduce(function (c, fn) {
      cov_13wuvjnnig.f[17]++;
      cov_13wuvjnnig.s[28]++;
      return (cov_13wuvjnnig.b[11][0]++, fn(c)) || (cov_13wuvjnnig.b[11][1]++, c);
    }, component);
  }
  /**
   * Component creation factory function that will enhance the user provided API
   * @param   {Object} component - a component implementation previously defined
   * @param   {Array} options.slots - component slots generated via riot compiler
   * @param   {Array} options.attributes - attribute expressions generated via riot compiler
   * @returns {Riot.Component} a riot component instance
   */


  function enhanceComponentAPI(component, _ref5) {
    var slots = _ref5.slots,
        attributes = _ref5.attributes;
    cov_13wuvjnnig.f[18]++;
    var attributeBindings = (cov_13wuvjnnig.s[29]++, createAttributeBindings(attributes));
    cov_13wuvjnnig.s[30]++;
    return autobindMethods(runPlugins(defineProperties(Object.create(component), {
      mount: function mount(element) {
        var state = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : (cov_13wuvjnnig.b[12][0]++, {});
        var parentScope = arguments.length > 2 ? arguments[2] : undefined;
        cov_13wuvjnnig.f[19]++;
        cov_13wuvjnnig.s[31]++;
        this.props = evaluateProps(element, attributes, parentScope, {});
        cov_13wuvjnnig.s[32]++;
        this.state = _objectSpread({}, this.state, callOrAssign(state));
        cov_13wuvjnnig.s[33]++;
        defineProperties(this, {
          root: element,
          attributes: attributeBindings.createDOM(element).clone(),
          template: this.template.createDOM(element).clone()
        }); // link this object to the DOM node

        cov_13wuvjnnig.s[34]++;
        element[DOM_COMPONENT_INSTANCE_PROPERTY] = this;
        cov_13wuvjnnig.s[35]++;
        this.onBeforeMount(); // handlte the template and its attributes

        cov_13wuvjnnig.s[36]++;
        this.attributes.mount(element, parentScope);
        cov_13wuvjnnig.s[37]++;
        this.template.mount(element, this); // create the slots and mount them

        cov_13wuvjnnig.s[38]++;
        defineProperty(this, 'slots', createSlots(element, (cov_13wuvjnnig.b[13][0]++, slots) || (cov_13wuvjnnig.b[13][1]++, [])));
        cov_13wuvjnnig.s[39]++;
        this.slots.mount(parentScope);
        cov_13wuvjnnig.s[40]++;
        this.onMounted();
        cov_13wuvjnnig.s[41]++;
        return this;
      },
      update: function update() {
        var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : (cov_13wuvjnnig.b[14][0]++, {});
        var parentScope = arguments.length > 1 ? arguments[1] : undefined;
        cov_13wuvjnnig.f[20]++;
        var newProps = (cov_13wuvjnnig.s[42]++, evaluateProps(this.root, attributes, parentScope, this.props));
        cov_13wuvjnnig.s[43]++;

        if (this.shouldUpdate(newProps, state) === false) {
          cov_13wuvjnnig.b[15][0]++;
          cov_13wuvjnnig.s[44]++;
          return;
        } else {
          cov_13wuvjnnig.b[15][1]++;
        }

        cov_13wuvjnnig.s[45]++;
        this.onBeforeUpdate();
        cov_13wuvjnnig.s[46]++;
        this.props = newProps;
        cov_13wuvjnnig.s[47]++;
        this.state = _objectSpread({}, this.state, state);
        cov_13wuvjnnig.s[48]++;

        if (parentScope) {
          cov_13wuvjnnig.b[16][0]++;
          cov_13wuvjnnig.s[49]++;
          this.attributes.update(parentScope);
          cov_13wuvjnnig.s[50]++;
          this.slots.update(parentScope);
        } else {
          cov_13wuvjnnig.b[16][1]++;
        }

        cov_13wuvjnnig.s[51]++;
        this.template.update(this);
        cov_13wuvjnnig.s[52]++;
        this.onUpdated();
        cov_13wuvjnnig.s[53]++;
        return this;
      },
      unmount: function unmount(removeRoot) {
        cov_13wuvjnnig.f[21]++;
        cov_13wuvjnnig.s[54]++;
        this.onBeforeUnmount();
        cov_13wuvjnnig.s[55]++;
        this.attributes.unmount();
        cov_13wuvjnnig.s[56]++;
        this.slots.unmount();
        cov_13wuvjnnig.s[57]++;
        this.template.unmount(this, removeRoot === true);
        cov_13wuvjnnig.s[58]++;
        this.onUnmounted();
        cov_13wuvjnnig.s[59]++;
        return this;
      }
    })), Object.keys(component).filter(function (prop) {
      cov_13wuvjnnig.f[22]++;
      cov_13wuvjnnig.s[60]++;
      return isFunction(component[prop]);
    }));
  }
  /**
   * Component initialization function starting from a DOM node
   * @param   {HTMLElement} element - element to upgrade
   * @param   {Object} initialState - initial component state
   * @param   {string} componentName - component id
   * @returns {Object} a new component instance bound to a DOM node
   */

  function mountComponent(element, initialState, componentName) {
    cov_13wuvjnnig.f[23]++;
    var name = (cov_13wuvjnnig.s[61]++, (cov_13wuvjnnig.b[17][0]++, componentName) || (cov_13wuvjnnig.b[17][1]++, getName(element)));
    cov_13wuvjnnig.s[62]++;

    if (!COMPONENTS_IMPLEMENTATION_MAP.has(name)) {
      cov_13wuvjnnig.b[18][0]++;
      cov_13wuvjnnig.s[63]++;
      panic("The component named \"".concat(name, "\" was never registered"));
    } else {
      cov_13wuvjnnig.b[18][1]++;
    }

    var component = (cov_13wuvjnnig.s[64]++, COMPONENTS_IMPLEMENTATION_MAP.get(name)({}));
    cov_13wuvjnnig.s[65]++;
    return component.mount(element, {}, initialState);
  }

  /* eslint-disable */
  // source: https://30secondsofcode.org/function#compose
  var compose = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)));

  var cov_ktbylgfi7 = function () {
    var path = "/Users/gianlucaguarini/Sites/riot/riot/src/riot.js";
    var hash = "13d3e4604a382c1765bb58bd2a9c6e998de32888";

    var Function = function () {}.constructor;

    var global = new Function("return this")();
    var gcv = "__coverage__";
    var coverageData = {
      path: "/Users/gianlucaguarini/Sites/riot/riot/src/riot.js",
      statementMap: {
        "0": {
          start: {
            line: 9,
            column: 88
          },
          end: {
            line: 9,
            column: 95
          }
        },
        "1": {
          start: {
            line: 22,
            column: 2
          },
          end: {
            line: 22,
            column: 102
          }
        },
        "2": {
          start: {
            line: 22,
            column: 47
          },
          end: {
            line: 22,
            column: 102
          }
        },
        "3": {
          start: {
            line: 24,
            column: 2
          },
          end: {
            line: 24,
            column: 86
          }
        },
        "4": {
          start: {
            line: 26,
            column: 2
          },
          end: {
            line: 26,
            column: 38
          }
        },
        "5": {
          start: {
            line: 35,
            column: 2
          },
          end: {
            line: 35,
            column: 101
          }
        },
        "6": {
          start: {
            line: 35,
            column: 48
          },
          end: {
            line: 35,
            column: 101
          }
        },
        "7": {
          start: {
            line: 37,
            column: 2
          },
          end: {
            line: 37,
            column: 44
          }
        },
        "8": {
          start: {
            line: 38,
            column: 2
          },
          end: {
            line: 38,
            column: 25
          }
        },
        "9": {
          start: {
            line: 40,
            column: 2
          },
          end: {
            line: 40,
            column: 38
          }
        },
        "10": {
          start: {
            line: 51,
            column: 2
          },
          end: {
            line: 51,
            column: 81
          }
        },
        "11": {
          start: {
            line: 51,
            column: 37
          },
          end: {
            line: 51,
            column: 80
          }
        },
        "12": {
          start: {
            line: 60,
            column: 2
          },
          end: {
            line: 65,
            column: 4
          }
        },
        "13": {
          start: {
            line: 61,
            column: 4
          },
          end: {
            line: 63,
            column: 5
          }
        },
        "14": {
          start: {
            line: 62,
            column: 6
          },
          end: {
            line: 62,
            column: 56
          }
        },
        "15": {
          start: {
            line: 64,
            column: 4
          },
          end: {
            line: 64,
            column: 18
          }
        },
        "16": {
          start: {
            line: 74,
            column: 2
          },
          end: {
            line: 74,
            column: 68
          }
        },
        "17": {
          start: {
            line: 74,
            column: 27
          },
          end: {
            line: 74,
            column: 68
          }
        },
        "18": {
          start: {
            line: 75,
            column: 2
          },
          end: {
            line: 75,
            column: 71
          }
        },
        "19": {
          start: {
            line: 75,
            column: 31
          },
          end: {
            line: 75,
            column: 71
          }
        },
        "20": {
          start: {
            line: 77,
            column: 2
          },
          end: {
            line: 77,
            column: 25
          }
        },
        "21": {
          start: {
            line: 79,
            column: 2
          },
          end: {
            line: 79,
            column: 20
          }
        },
        "22": {
          start: {
            line: 88,
            column: 2
          },
          end: {
            line: 88,
            column: 72
          }
        },
        "23": {
          start: {
            line: 88,
            column: 32
          },
          end: {
            line: 88,
            column: 72
          }
        },
        "24": {
          start: {
            line: 90,
            column: 2
          },
          end: {
            line: 90,
            column: 28
          }
        },
        "25": {
          start: {
            line: 92,
            column: 2
          },
          end: {
            line: 92,
            column: 20
          }
        },
        "26": {
          start: {
            line: 98,
            column: 25
          },
          end: {
            line: 98,
            column: 61
          }
        },
        "27": {
          start: {
            line: 98,
            column: 38
          },
          end: {
            line: 98,
            column: 43
          }
        },
        "28": {
          start: {
            line: 101,
            column: 23
          },
          end: {
            line: 101,
            column: 28
          }
        },
        "29": {
          start: {
            line: 104,
            column: 18
          },
          end: {
            line: 108,
            column: 1
          }
        }
      },
      fnMap: {
        "0": {
          name: "register",
          decl: {
            start: {
              line: 21,
              column: 16
            },
            end: {
              line: 21,
              column: 24
            }
          },
          loc: {
            start: {
              line: 21,
              column: 53
            },
            end: {
              line: 27,
              column: 1
            }
          },
          line: 21
        },
        "1": {
          name: "unregister",
          decl: {
            start: {
              line: 34,
              column: 16
            },
            end: {
              line: 34,
              column: 26
            }
          },
          loc: {
            start: {
              line: 34,
              column: 33
            },
            end: {
              line: 41,
              column: 1
            }
          },
          line: 34
        },
        "2": {
          name: "mount",
          decl: {
            start: {
              line: 50,
              column: 16
            },
            end: {
              line: 50,
              column: 21
            }
          },
          loc: {
            start: {
              line: 50,
              column: 52
            },
            end: {
              line: 52,
              column: 1
            }
          },
          line: 50
        },
        "3": {
          name: "(anonymous_3)",
          decl: {
            start: {
              line: 51,
              column: 26
            },
            end: {
              line: 51,
              column: 27
            }
          },
          loc: {
            start: {
              line: 51,
              column: 37
            },
            end: {
              line: 51,
              column: 80
            }
          },
          line: 51
        },
        "4": {
          name: "unmount",
          decl: {
            start: {
              line: 59,
              column: 16
            },
            end: {
              line: 59,
              column: 23
            }
          },
          loc: {
            start: {
              line: 59,
              column: 34
            },
            end: {
              line: 66,
              column: 1
            }
          },
          line: 59
        },
        "5": {
          name: "(anonymous_5)",
          decl: {
            start: {
              line: 60,
              column: 26
            },
            end: {
              line: 60,
              column: 27
            }
          },
          loc: {
            start: {
              line: 60,
              column: 37
            },
            end: {
              line: 65,
              column: 3
            }
          },
          line: 60
        },
        "6": {
          name: "install",
          decl: {
            start: {
              line: 73,
              column: 16
            },
            end: {
              line: 73,
              column: 23
            }
          },
          loc: {
            start: {
              line: 73,
              column: 32
            },
            end: {
              line: 80,
              column: 1
            }
          },
          line: 73
        },
        "7": {
          name: "uninstall",
          decl: {
            start: {
              line: 87,
              column: 16
            },
            end: {
              line: 87,
              column: 25
            }
          },
          loc: {
            start: {
              line: 87,
              column: 34
            },
            end: {
              line: 93,
              column: 1
            }
          },
          line: 87
        },
        "8": {
          name: "(anonymous_8)",
          decl: {
            start: {
              line: 98,
              column: 33
            },
            end: {
              line: 98,
              column: 34
            }
          },
          loc: {
            start: {
              line: 98,
              column: 38
            },
            end: {
              line: 98,
              column: 43
            }
          },
          line: 98
        }
      },
      branchMap: {
        "0": {
          loc: {
            start: {
              line: 22,
              column: 2
            },
            end: {
              line: 22,
              column: 102
            }
          },
          type: "if",
          locations: [{
            start: {
              line: 22,
              column: 2
            },
            end: {
              line: 22,
              column: 102
            }
          }, {
            start: {
              line: 22,
              column: 2
            },
            end: {
              line: 22,
              column: 102
            }
          }],
          line: 22
        },
        "1": {
          loc: {
            start: {
              line: 35,
              column: 2
            },
            end: {
              line: 35,
              column: 101
            }
          },
          type: "if",
          locations: [{
            start: {
              line: 35,
              column: 2
            },
            end: {
              line: 35,
              column: 101
            }
          }, {
            start: {
              line: 35,
              column: 2
            },
            end: {
              line: 35,
              column: 101
            }
          }],
          line: 35
        },
        "2": {
          loc: {
            start: {
              line: 61,
              column: 4
            },
            end: {
              line: 63,
              column: 5
            }
          },
          type: "if",
          locations: [{
            start: {
              line: 61,
              column: 4
            },
            end: {
              line: 63,
              column: 5
            }
          }, {
            start: {
              line: 61,
              column: 4
            },
            end: {
              line: 63,
              column: 5
            }
          }],
          line: 61
        },
        "3": {
          loc: {
            start: {
              line: 74,
              column: 2
            },
            end: {
              line: 74,
              column: 68
            }
          },
          type: "if",
          locations: [{
            start: {
              line: 74,
              column: 2
            },
            end: {
              line: 74,
              column: 68
            }
          }, {
            start: {
              line: 74,
              column: 2
            },
            end: {
              line: 74,
              column: 68
            }
          }],
          line: 74
        },
        "4": {
          loc: {
            start: {
              line: 75,
              column: 2
            },
            end: {
              line: 75,
              column: 71
            }
          },
          type: "if",
          locations: [{
            start: {
              line: 75,
              column: 2
            },
            end: {
              line: 75,
              column: 71
            }
          }, {
            start: {
              line: 75,
              column: 2
            },
            end: {
              line: 75,
              column: 71
            }
          }],
          line: 75
        },
        "5": {
          loc: {
            start: {
              line: 88,
              column: 2
            },
            end: {
              line: 88,
              column: 72
            }
          },
          type: "if",
          locations: [{
            start: {
              line: 88,
              column: 2
            },
            end: {
              line: 88,
              column: 72
            }
          }, {
            start: {
              line: 88,
              column: 2
            },
            end: {
              line: 88,
              column: 72
            }
          }],
          line: 88
        }
      },
      s: {
        "0": 0,
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0,
        "6": 0,
        "7": 0,
        "8": 0,
        "9": 0,
        "10": 0,
        "11": 0,
        "12": 0,
        "13": 0,
        "14": 0,
        "15": 0,
        "16": 0,
        "17": 0,
        "18": 0,
        "19": 0,
        "20": 0,
        "21": 0,
        "22": 0,
        "23": 0,
        "24": 0,
        "25": 0,
        "26": 0,
        "27": 0,
        "28": 0,
        "29": 0
      },
      f: {
        "0": 0,
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0,
        "6": 0,
        "7": 0,
        "8": 0
      },
      b: {
        "0": [0, 0],
        "1": [0, 0],
        "2": [0, 0],
        "3": [0, 0],
        "4": [0, 0],
        "5": [0, 0]
      },
      _coverageSchema: "43e27e138ebf9cfc5966b082cf9a028302ed4184"
    };
    var coverage = global[gcv] || (global[gcv] = {});

    if (coverage[path] && coverage[path].hash === hash) {
      return coverage[path];
    }

    coverageData.hash = hash;
    return coverage[path] = coverageData;
  }();

  var _ref = (cov_ktbylgfi7.s[0]++, globals),
      DOM_COMPONENT_INSTANCE_PROPERTY$1 = _ref.DOM_COMPONENT_INSTANCE_PROPERTY,
      COMPONENTS_IMPLEMENTATION_MAP$1 = _ref.COMPONENTS_IMPLEMENTATION_MAP,
      PLUGINS_SET$1 = _ref.PLUGINS_SET;
  /**
   * Riot public api
   */

  /**
   * Register a custom tag by name
   * @param   {string} name - component name
   * @param   {Object} implementation - tag implementation
   * @returns {Map} map containing all the components implementations
   */


  function register(name, _ref2) {
    var css = _ref2.css,
        template = _ref2.template,
        tag = _ref2.tag;
    cov_ktbylgfi7.f[0]++;
    cov_ktbylgfi7.s[1]++;

    if (COMPONENTS_IMPLEMENTATION_MAP$1.has(name)) {
      cov_ktbylgfi7.b[0][0]++;
      cov_ktbylgfi7.s[2]++;
      panic("The component \"".concat(name, "\" was already registered"));
    } else {
      cov_ktbylgfi7.b[0][1]++;
    }

    cov_ktbylgfi7.s[3]++;
    COMPONENTS_IMPLEMENTATION_MAP$1.set(name, createComponent({
      name: name,
      css: css,
      template: template,
      tag: tag
    }));
    cov_ktbylgfi7.s[4]++;
    return COMPONENTS_IMPLEMENTATION_MAP$1;
  }
  /**
   * Unregister a riot web component
   * @param   {string} name - component name
   * @returns {Map} map containing all the components implementations
   */

  function unregister(name) {
    cov_ktbylgfi7.f[1]++;
    cov_ktbylgfi7.s[5]++;

    if (!COMPONENTS_IMPLEMENTATION_MAP$1.has(name)) {
      cov_ktbylgfi7.b[1][0]++;
      cov_ktbylgfi7.s[6]++;
      panic("The component \"".concat(name, "\" was never registered"));
    } else {
      cov_ktbylgfi7.b[1][1]++;
    }

    cov_ktbylgfi7.s[7]++;
    COMPONENTS_IMPLEMENTATION_MAP$1.delete(name);
    cov_ktbylgfi7.s[8]++;
    cssManager.remove(name);
    cov_ktbylgfi7.s[9]++;
    return COMPONENTS_IMPLEMENTATION_MAP$1;
  }
  /**
   * Mounting function that will work only for the components that were globally registered
   * @param   {string|HTMLElement} selector - query for the selection or a DOM element
   * @param   {Object} initialState - the initial component state
   * @param   {string} name - optional component name
   * @returns {Array} list of nodes upgraded
   */

  function mount(selector, initialState, name) {
    cov_ktbylgfi7.f[2]++;
    cov_ktbylgfi7.s[10]++;
    return $$(selector).map(function (element) {
      cov_ktbylgfi7.f[3]++;
      cov_ktbylgfi7.s[11]++;
      return mountComponent(element, initialState, name);
    });
  }
  /**
   * Sweet unmounting helper function for the DOM node mounted manually by the user
   * @param   {string|HTMLElement} selector - query for the selection or a DOM element
   * @returns {Array} list of nodes unmounted
   */

  function unmount(selector) {
    cov_ktbylgfi7.f[4]++;
    cov_ktbylgfi7.s[12]++;
    return $$(selector).map(function (element) {
      cov_ktbylgfi7.f[5]++;
      cov_ktbylgfi7.s[13]++;

      if (element[DOM_COMPONENT_INSTANCE_PROPERTY$1]) {
        cov_ktbylgfi7.b[2][0]++;
        cov_ktbylgfi7.s[14]++;
        element[DOM_COMPONENT_INSTANCE_PROPERTY$1].unmount();
      } else {
        cov_ktbylgfi7.b[2][1]++;
      }

      cov_ktbylgfi7.s[15]++;
      return element;
    });
  }
  /**
   * Define a riot plugin
   * @param   {Function} plugin - function that will receive all the components created
   * @returns {Set} the set containing all the plugins installed
   */

  function install(plugin) {
    cov_ktbylgfi7.f[6]++;
    cov_ktbylgfi7.s[16]++;

    if (!isFunction(plugin)) {
      cov_ktbylgfi7.b[3][0]++;
      cov_ktbylgfi7.s[17]++;
      panic('Plugins must be of type function');
    } else {
      cov_ktbylgfi7.b[3][1]++;
    }

    cov_ktbylgfi7.s[18]++;

    if (PLUGINS_SET$1.has(plugin)) {
      cov_ktbylgfi7.b[4][0]++;
      cov_ktbylgfi7.s[19]++;
      panic('This plugin was already install');
    } else {
      cov_ktbylgfi7.b[4][1]++;
    }

    cov_ktbylgfi7.s[20]++;
    PLUGINS_SET$1.add(plugin);
    cov_ktbylgfi7.s[21]++;
    return PLUGINS_SET$1;
  }
  /**
   * Uninstall a riot plugin
   * @param   {Function} plugin - plugin previously installed
   * @returns {Set} the set containing all the plugins installed
   */

  function uninstall(plugin) {
    cov_ktbylgfi7.f[7]++;
    cov_ktbylgfi7.s[22]++;

    if (!PLUGINS_SET$1.has(plugin)) {
      cov_ktbylgfi7.b[5][0]++;
      cov_ktbylgfi7.s[23]++;
      panic('This plugin was never installed');
    } else {
      cov_ktbylgfi7.b[5][1]++;
    }

    cov_ktbylgfi7.s[24]++;
    PLUGINS_SET$1.delete(plugin);
    cov_ktbylgfi7.s[25]++;
    return PLUGINS_SET$1;
  }
  /**
   * Helpter method to create an anonymous component without the need to register it
   */

  var component = (cov_ktbylgfi7.s[26]++, compose(function (c) {
    cov_ktbylgfi7.f[8]++;
    cov_ktbylgfi7.s[27]++;
    return c({});
  }, createComponent));
  /** @type {string} current riot version */

  var version = (cov_ktbylgfi7.s[28]++, 'v4.0.0-alpha.4'); // expose some internal stuff that might be used from external tools

  var __ = (cov_ktbylgfi7.s[29]++, {
    cssManager: cssManager,
    defineComponent: defineComponent,
    globals: globals
  });

  exports.register = register;
  exports.unregister = unregister;
  exports.mount = mount;
  exports.unmount = unmount;
  exports.install = install;
  exports.uninstall = uninstall;
  exports.component = component;
  exports.version = version;
  exports.__ = __;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
