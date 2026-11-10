// Preload script loaded before test workers/environment initialize
// Fixes undici/jsdom on Node < 22.15 where zlib.createZstdDecompress is undefined
const zlib = require('node:zlib');
const { Transform } = require('node:stream');

if (typeof zlib.createZstdDecompress !== 'function') {
  zlib.createZstdDecompress = function () {
    return new Transform();
  };
}
if (!zlib.constants) {
  zlib.constants = {};
}
if (typeof zlib.constants.ZSTD_d_windowLogMax === 'undefined') {
  zlib.constants.ZSTD_d_windowLogMax = 0;
}
