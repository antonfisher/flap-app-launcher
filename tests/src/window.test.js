const assert = require('assert');
const simple = require('simple-mock');
const proxyquire = require('proxyquire').noCallThru();

const createStub = loadURL => ({
  electron: {
    screen: {
      getPrimaryDisplay() {
        return {
          workAreaSize: {
            width: 1000,
            height: 60
          }
        };
      }
    },
    BrowserWindow: function BrowserWindow(props) {
      this.props = props;
      this.loadURL = loadURL;
      return this;
    }
  }
});

describe('Window', () => {
  describe('create()', () => {
    it('should return new object and with loaded url', () => {
      const loadURLStub = simple.stub();
      const window = proxyquire('../../src/window.js', createStub(loadURLStub));
      window.create();
      assert.deepEqual(loadURLStub.callCount, 1);
    });

    it('should set window to the center of a screen', () => {
      const window = proxyquire('../../src/window.js', createStub(simple.stub()));
      const wnd = window.create(window.TYPE_MAIN, 500, 30);
      assert.deepEqual(wnd.props.x, 250);
      assert.deepEqual(wnd.props.y, 15);
    });
  });
});
