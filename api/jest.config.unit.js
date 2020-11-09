const defaults = require('./jest.config');

module.exports = Object.assign({
  // The glob patterns Jest uses to detect test files
  testMatch: [
    "**/tests/unit/**/*.test.{js,ts}"
  ]
}, defaults);
