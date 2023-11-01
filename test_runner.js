const Mocha = require('mocha');

const mocha = new Mocha();

mocha.addFile('edge_test.js');

mocha.run((failures) => {
  process.exit(failures);
});