/**
 * Based on Meteor's Base64 package.
 * Rewrite with ES6 and better formated for passing
 * linter
 */
var BASE_64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
var BASE_64_VALS = {};

(function setupBase64Vals() {
  for (let j = 0; j < BASE_64_CHARS.length; j++) {
    BASE_64_VALS[BASE_64_CHARS.charAt(j)] = j;
  }
})();

var getChar = function(val) {
  return BASE_64_CHARS.charAt(val);
};

var getVal = function(ch) {
  if (ch === '=') {
    return -1;
  }
  return BASE_64_VALS[ch];
};

// Base 64 encoding
export class Base64 {
  encode(array) {
    if (typeof array === 'string') {
      var str = array;
      array = this.newBinary(str.length);
      for (let i = 0; i < str.length; i++) {
        var ch = str.charCodeAt(i);
        if (ch > 0xFF) {
          throw new Error(
            'Not ascii. Base64.encode can only take ascii strings.');
        }
        array[i] = ch;
      }
    }

    var answer = [];
    var a = null;
    var b = null;
    var c = null;
    var d = null;
    for (let i = 0; i < array.length; i++) {
      switch (i % 3) {
        case 0:
          a = (array[i] >> 2) & 0x3F;
          b = (array[i] & 0x03) << 4;
          break;
        case 1:
          b |= (array[i] >> 4) & 0xF;
          c = (array[i] & 0xF) << 2;
          break;
        case 2:
          c |= (array[i] >> 6) & 0x03;
          d = array[i] & 0x3F;
          answer.push(getChar(a));
          answer.push(getChar(b));
          answer.push(getChar(c));
          answer.push(getChar(d));
          a = null;
          b = null;
          c = null;
          d = null;
          break;
      }
    }
    if (a != null) {
      answer.push(getChar(a));
      answer.push(getChar(b));
      if (c == null) {
        answer.push('=');
      } else {
        answer.push(getChar(c));
      }
      if (d == null) {
        answer.push('=');
      }
    }
    return answer.join('');
  }

  decode(str) {
    var len = Math.floor((str.length*3)/4);
    if (str.charAt(str.length - 1) == '=') {
      len--;
      if (str.charAt(str.length - 2) == '=') {
        len--;
      }
    }
    var arr = this.newBinary(len);

    var one = null;
    var two = null;
    var three = null;

    var j = 0;

    for (let i = 0; i < str.length; i++) {
      var c = str.charAt(i);
      var v = getVal(c);
      switch (i % 4) {
        case 0:
          if (v < 0) {
            throw new Error('invalid base64 string');
          }
          one = v << 2;
          break;
        case 1:
          if (v < 0) {
            throw new Error('invalid base64 string');
          }
          one |= (v >> 4);
          arr[j++] = one;
          two = (v & 0x0F) << 4;
          break;
        case 2:
          if (v >= 0) {
            two |= (v >> 2);
            arr[j++] = two;
            three = (v & 0x03) << 6;
          }
          break;
        case 3:
          if (v >= 0) {
            arr[j++] = three | v;
          }
          break;
      }
    }
    return arr;
  }

  newBinary(len) {
    if (typeof Uint8Array === 'undefined' || typeof ArrayBuffer === 'undefined') {
      var ret = [];
      for (let i = 0; i < len; i++) {
        ret.push(0);
      }
      ret.$Uint8ArrayPolyfill = true;
      return ret;
    }
    return new Uint8Array(new ArrayBuffer(len));
  }
}

export default new Base64();
