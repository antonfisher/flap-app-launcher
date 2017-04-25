const assert = require('assert');
const simple = require('simple-mock');
const proxyquire = require('proxyquire').noCallThru();

const CONFIG_MOCK = {hotkey: 'super', width: 500};
const DEFAULT_STUB = {
  fs: {
    readFile: simple.stub().callbackWith(null, JSON.stringify(CONFIG_MOCK)),
    writeFile: simple.stub().callbackWith(null)
  },
  './logger': {
    info: simple.stub().returnWith(),
    warn: simple.stub().returnWith()
  }
};

describe('Config', () => {
  describe('cached config', () => {
    const configs = proxyquire('../../src/configs.js', DEFAULT_STUB);

    it('shoud set and get config properly', () => {
      configs.setCachedConfig(CONFIG_MOCK);
      assert.deepEqual(configs.getCachedConfig(), CONFIG_MOCK);
    });

    it('loadConfig() function should use cached config if it exists', (done) => {
      configs.setCachedConfig(CONFIG_MOCK);
      configs.loadConfig()
        .then((data) => {
          assert.deepEqual(data, CONFIG_MOCK);
          done();
        })
        .catch(done);
    });
  });

  describe('loadConfig()', () => {
    it('should load config from file', (done) => {
      const configs = proxyquire('../../src/configs.js', Object.assign({}, DEFAULT_STUB));
      configs.setCachedConfig(null);
      configs.loadConfig()
        .then((data) => {
          assert.deepEqual(data, CONFIG_MOCK);
          done();
        })
        .catch(done);
    });

    it('should not print any warnings or write file, if no errors with config file', (done) => {
      const info = simple.stub();
      const warn = simple.stub();
      const readFile = simple.stub().callbackWith(null, JSON.stringify(CONFIG_MOCK));
      const writeFile = simple.stub().callbackWith(null);
      const configs = proxyquire(
        '../../src/configs.js',
        Object.assign({}, DEFAULT_STUB, {'./logger': {info, warn}, fs: {readFile, writeFile}})
      );
      configs.setCachedConfig(null);
      configs.loadConfig()
        .then(() => {
          assert.equal(warn.callCount, 0);
          assert.equal(writeFile.callCount, 0);
          done();
        })
        .catch(done);
    });

    it('should return default config in case of bad json', (done) => {
      const readFile = simple.stub().callbackWith(null, '}{');
      const writeFile = simple.stub().callbackWith(null);
      const configs = proxyquire(
        '../../src/configs.js',
        Object.assign({}, DEFAULT_STUB, {fs: {readFile, writeFile}})
      );
      configs.setCachedConfig(null);
      configs.loadConfig()
        .then((data) => {
          assert.deepEqual(data, configs.DEFAULT_CONFIG);
          assert.equal(readFile.callCount, 1);
          assert.equal(writeFile.callCount, 1);
          done();
        })
        .catch(done);
    });

    it('should return default config in case of any error with file reading', (done) => {
      const readFile = simple.stub().callbackWith('Error');
      const writeFile = simple.stub().callbackWith(null);
      const configs = proxyquire(
        '../../src/configs.js',
        Object.assign({}, DEFAULT_STUB, {fs: {readFile, writeFile}})
      );
      configs.setCachedConfig(null);
      configs.loadConfig()
        .then((data) => {
          assert.deepEqual(data, configs.DEFAULT_CONFIG);
          assert.equal(readFile.callCount, 1);
          assert.equal(writeFile.callCount, 1);
          done();
        })
        .catch(done);
    });

    it('should log warning message and create new file if some error happened while reading', (done) => {
      const info = simple.stub();
      const warn = simple.stub();
      const readFile = simple.stub().callbackWith('Error');
      const writeFile = simple.stub().callbackWith(null);
      const configs = proxyquire(
        '../../src/configs.js',
        Object.assign({}, {'./logger': {info, warn}, fs: {readFile, writeFile}})
      );
      configs.setCachedConfig(null);
      configs.loadConfig()
        .then(() => {
          assert.equal(warn.callCount, 1);
          assert.equal(writeFile.callCount, 1);
          done();
        })
        .catch(done);
    });
  });

  let env;
  describe('saveConfig()', () => {
    beforeEach(() => {
      env = process.env.NODE_ENV;
    });

    afterEach(() => {
      process.env.NODE_ENV = env;
    });

    it('should save and return passed data', (done) => {
      const configs = proxyquire('../../src/configs.js', Object.assign({}, DEFAULT_STUB));
      const newConfig = {hotkey: 'super+space'};
      configs.setCachedConfig(null);
      configs.saveConfig(newConfig)
        .then((data) => {
          assert.deepEqual(data, {hotkey: 'super+space', width: 500});
          done();
        })
        .catch(done);
    });

    it('should not save unsuported values', (done) => {
      const configs = proxyquire('../../src/configs.js', Object.assign({}, DEFAULT_STUB));
      const newConfig = {hotkey: 'space', hehe: 'no'};
      configs.setCachedConfig(null);
      configs.saveConfig(newConfig)
        .then((data) => {
          assert.deepEqual(data, {hotkey: 'space', width: 500});
          done();
        })
        .catch(done);
    });

    it('should use default config if new values were not passed for save', (done) => {
      const configs = proxyquire('../../src/configs.js', Object.assign({}, DEFAULT_STUB));
      configs.setCachedConfig(null);
      configs.saveConfig({})
        .then((data) => {
          assert.deepEqual(data, configs.DEFAULT_CONFIG);
          done();
        })
        .catch(done);
    });

    it('should use previously cached values if new values were not passed for save', (done) => {
      const configs = proxyquire('../../src/configs.js', Object.assign({}, DEFAULT_STUB));
      const previousConfig = {hotkey: 'space', width: 500};
      configs.setCachedConfig(previousConfig);
      configs.saveConfig({})
        .then((data) => {
          assert.deepEqual(data, previousConfig);
          done();
        })
        .catch(done);
    });

    it('should log warning message if some error happened while writing file', (done) => {
      const warn = simple.stub();
      const writeFile = simple.stub().callbackWith('Error');
      const configs = proxyquire(
        '../../src/configs.js',
        Object.assign({}, {'./logger': {warn}, fs: {writeFile}})
      );
      configs.setCachedConfig(null);
      configs.saveConfig(CONFIG_MOCK)
        .then(() => {
          assert.equal(warn.callCount, 1);
          assert.equal(writeFile.callCount, 1);
          done();
        })
        .catch(done);
    });

    it('should use different files for development and production envs', (done) => {
      const warn = simple.stub();
      const writeFile = simple.stub().callbackWith('Error');

      let configsFileDevelopment;
      process.env.NODE_ENV = 'development';
      const configs1 = proxyquire(
        '../../src/configs.js',
        Object.assign({}, {'./logger': {warn}, fs: {writeFile}})
      );
      configs1.saveConfig({})
        .then(() => {
          assert.equal(writeFile.callCount, 1);
          configsFileDevelopment = writeFile.lastCall.args[0];

          let configsFileProduction;
          process.env.NODE_ENV = 'production';
          const configs2 = proxyquire(
            '../../src/configs.js',
            Object.assign({}, {'./logger': {warn}, fs: {writeFile}})
          );
          configs2.saveConfig({})
            .then(() => {
              assert.equal(writeFile.callCount, 2);
              configsFileProduction = writeFile.lastCall.args[0];
              assert.notEqual(configsFileDevelopment, configsFileProduction);
              done();
            })
            .catch(done);
        })
        .catch(done);
    });
  });
});
