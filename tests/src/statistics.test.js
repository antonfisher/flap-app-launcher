const assert = require('assert');
const statistics = require('../../src/statistics');

describe('Statistics', () => {
  describe('Manage cached statistics', () => {
    it('shoud set and get statistics properly', () => {
      const initStats = {chrome: 5};
      statistics.setCachedStats(initStats);
      assert.equal(statistics.getCachedStats(), initStats);
    });

    it('loadStats() function should use cached stats if it exists', (done) => {
      const initStats = {chrome: 5};
      statistics.setCachedStats(initStats);
      statistics.loadStats()
        .then((stats) => {
          assert.equal(stats, initStats);
          done();
        })
        .catch(done);
    });
  });

  describe('sortCommands()', () => {
    it('commands should be sorted with respect to stats (path)', () => {
      statistics.setCachedStats({cal: 5, chrome: 10});
      const commands = [{path: 'c'}, {path: 'cal'}, {path: 'chrome'}, {path: 'b'}, {path: 'a'}];
      const result = statistics.sortCommands(commands).map(({path}) => path).join(',');
      assert.equal(result, 'chrome,cal,a,b,c');
    });
    it('commands should be sorted with respect to stats (rawPath)', () => {
      statistics.setCachedStats({cal: 5, chrome: 10});
      const commands = [{path: 'c'}, {rawPath: 'cal'}, {path: 'chrome'}, {path: 'b'}, {path: 'a'}];
      const result = statistics.sortCommands(commands).map(({path, rawPath}) => path || rawPath).join(',');
      assert.equal(result, 'chrome,cal,a,b,c');
    });
    it('commands should be sorted properly without stats', () => {
      statistics.setCachedStats();
      const commands = [{path: 'c'}, {path: 'cal'}, {path: 'chrome'}, {path: 'b'}, {path: 'a'}];
      const result = statistics.sortCommands(commands).map(({path}) => path).join(',');
      assert.equal(result, 'a,b,c,cal,chrome');
    });
  });
});
