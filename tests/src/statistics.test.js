const assert = require('assert');
const simple = require('simple-mock');
const proxyquire = require('proxyquire').noCallThru();

const STATS_MOCK = {chrome: 5};
const DEFAULT_STUB = {
  fs: {
    readFile: simple.stub().callbackWith(null, JSON.stringify(STATS_MOCK)),
    writeFile: simple.stub().callbackWith(null)
  },
  './logger': {
    info: simple.stub().returnWith(),
    warn: simple.stub().returnWith()
  }
};

describe('Statistics', () => {
  describe('cached statistics', () => {
    const statistics = proxyquire('../../src/statistics.js', DEFAULT_STUB);

    it('shoud set and get statistics properly', () => {
      statistics.setCachedStats(STATS_MOCK);
      assert.deepEqual(statistics.getCachedStats(), STATS_MOCK);
    });

    it('loadStats() function should use cached stats if it exists', (done) => {
      statistics.setCachedStats(STATS_MOCK);
      statistics
        .loadStats()
        .then((stats) => {
          assert.deepEqual(stats, STATS_MOCK);
          done();
        })
        .catch(done);
    });
  });

  describe('sortCommands()', () => {
    const statistics = proxyquire('../../src/statistics.js', DEFAULT_STUB);

    it('commands should be sorted with respect to stats (path)', () => {
      statistics.setCachedStats({cal: 5, chrome: 10});
      const commands = [{path: 'c'}, {path: 'cal'}, {path: 'chrome'}, {path: 'b'}, {path: 'a'}];
      const result = statistics
        .sortCommands(commands)
        .map(({path}) => path)
        .join(',');
      assert.equal(result, 'chrome,cal,a,b,c');
    });

    it('commands should be sorted with respect to stats (rawPath)', () => {
      statistics.setCachedStats({cal: 5, chrome: 10});
      const commands = [{path: 'c'}, {rawPath: 'cal'}, {path: 'chrome'}, {path: 'b'}, {path: 'a'}];
      const result = statistics
        .sortCommands(commands)
        .map(({path, rawPath}) => path || rawPath)
        .join(',');
      assert.equal(result, 'chrome,cal,a,b,c');
    });

    it('commands should be sorted properly without stats', () => {
      statistics.setCachedStats();
      const commands = [{path: 'c'}, {path: 'cal'}, {path: 'chrome'}, {path: 'b'}, {path: 'a'}];
      const result = statistics
        .sortCommands(commands)
        .map(({path}) => path)
        .join(',');
      assert.equal(result, 'a,b,c,cal,chrome');
    });
  });

  describe('loadStats()', () => {
    it('should load stats from file', (done) => {
      const statistics = proxyquire('../../src/statistics.js', Object.assign({}, DEFAULT_STUB));
      statistics.setCachedStats(null);
      statistics
        .loadStats()
        .then((stats) => {
          assert.deepEqual(stats, STATS_MOCK);
          done();
        })
        .catch(done);
    });

    it('should not print any warnings or write file, if no errors with statistics file', (done) => {
      const info = simple.stub();
      const warn = simple.stub();
      const readFile = simple.stub().callbackWith(null, JSON.stringify(STATS_MOCK));
      const writeFile = simple.stub().callbackWith(null);
      const statistics = proxyquire(
        '../../src/statistics.js',
        Object.assign({}, DEFAULT_STUB, {'./logger': {info, warn}, fs: {readFile, writeFile}})
      );
      statistics.setCachedStats(null);
      statistics
        .loadStats()
        .then(() => {
          assert.equal(warn.callCount, 0);
          assert.equal(writeFile.callCount, 0);
          done();
        })
        .catch(done);
    });

    it('should return empty stats in case of bad json', (done) => {
      const readFile = simple.stub().callbackWith(null, '}{');
      const writeFile = simple.stub().callbackWith(null);
      const statistics = proxyquire(
        '../../src/statistics.js',
        Object.assign({}, DEFAULT_STUB, {fs: {readFile, writeFile}})
      );
      statistics.setCachedStats(null);
      statistics
        .loadStats()
        .then((stats) => {
          assert.deepEqual(stats, {});
          assert.equal(readFile.callCount, 1);
          assert.equal(writeFile.callCount, 1);
          done();
        })
        .catch(done);
    });

    it('should return empty stats in case of any error with file reading', (done) => {
      const readFile = simple.stub().callbackWith('Error');
      const writeFile = simple.stub().callbackWith(null);
      const statistics = proxyquire(
        '../../src/statistics.js',
        Object.assign({}, DEFAULT_STUB, {fs: {readFile, writeFile}})
      );
      statistics.setCachedStats(null);
      statistics
        .loadStats()
        .then((stats) => {
          assert.deepEqual(stats, {});
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
      const statistics = proxyquire(
        '../../src/statistics.js',
        Object.assign({}, {'./logger': {info, warn}, fs: {readFile, writeFile}})
      );
      statistics.setCachedStats(null);
      statistics
        .loadStats()
        .then(() => {
          assert.equal(warn.callCount, 1);
          assert.equal(writeFile.callCount, 1);
          done();
        })
        .catch(done);
    });
  });

  let env;
  describe('saveStats()', () => {
    beforeEach(() => {
      env = process.env.NODE_ENV;
    });

    afterEach(() => {
      process.env.NODE_ENV = env;
    });

    it('should log warning message if some error happened while writing file', (done) => {
      const warn = simple.stub();
      const writeFile = simple.stub().callbackWith('Error');
      const statistics = proxyquire(
        '../../src/statistics.js',
        Object.assign({}, {'./logger': {warn}, fs: {writeFile}})
      );
      statistics.setCachedStats(null);
      statistics.saveStats(STATS_MOCK, () => {
        assert.equal(warn.callCount, 1);
        assert.equal(writeFile.callCount, 1);
        done();
      });
    });

    it('should use different files for development and production envs', (done) => {
      const warn = simple.stub();
      const writeFile = simple.stub().callbackWith('Error');

      let statisticsFileDevelopment;
      process.env.NODE_ENV = 'development';
      const statistics1 = proxyquire(
        '../../src/statistics.js',
        Object.assign({}, {'./logger': {warn}, fs: {writeFile}})
      );
      statistics1.saveStats({}, () => {
        assert.equal(writeFile.callCount, 1);
        [statisticsFileDevelopment] = writeFile.lastCall.args;

        let statisticsFileProduction;
        process.env.NODE_ENV = 'production';
        const statistics2 = proxyquire(
          '../../src/statistics.js',
          Object.assign({}, {'./logger': {warn}, fs: {writeFile}})
        );
        statistics2.saveStats({}, () => {
          assert.equal(writeFile.callCount, 2);
          [statisticsFileProduction] = writeFile.lastCall.args;
          assert.notEqual(statisticsFileDevelopment, statisticsFileProduction);
          done();
        });
      });
    });
  });

  describe('addRecord()', () => {
    it('should create new record in stats', (done) => {
      const statistics = proxyquire('../../src/statistics.js', Object.assign({}, DEFAULT_STUB));
      statistics.setCachedStats(null);
      statistics
        .addRecord('cal')
        .then(() => {
          assert.deepEqual(statistics.getCachedStats(), Object.assign({}, STATS_MOCK, {cal: 1}));
          done();
        })
        .catch(done);
    });

    it('should update an existing record in stats', (done) => {
      const statistics = proxyquire('../../src/statistics.js', Object.assign({}, DEFAULT_STUB));
      statistics.setCachedStats(null);
      statistics
        .addRecord('chrome')
        .then(() => {
          assert.deepEqual(statistics.getCachedStats(), {chrome: 6});
          done();
        })
        .catch(done);
    });
  });
});
