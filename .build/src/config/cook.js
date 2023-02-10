'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const env = process.env;
const cookConfig = {
  endpoint: env.BLICK_COOK_ENDPOINT || `https://mock.test.blick.ch`,
  headers: {
    'User-Agent': 'internal-blick-escenic-cue-live-api',
  },
  timeout: 3000,
  pathPrefix: '/blick/cue-live/entry',
};
exports.default = cookConfig;
//# sourceMappingURL=cook.js.map
