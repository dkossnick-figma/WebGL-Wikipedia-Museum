/**
 * Wikipedia Art Gallery constants
 * For node.js
 */

var WAGConsts = {
  UNKNOWN_METHOD: -1,
  SUCCESS       :  0,
  UNKNOWN       :  1,
  EMPTY_CATEGORY:  2
};

if (typeof exports != "undefined") {
  for (var i in WAGConsts) {
    exports[i] = WAGConsts[i];
  }
}
