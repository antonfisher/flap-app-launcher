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
      this.setMenu = () => {};
      return this;
    }
  }
});

describe('Window', () => {
  describe('createMainWindow()', () => {
    it('should return new object and with loaded url', () => {
      const loadURLStub = simple.stub();
      const window = proxyquire('../../src/windows.js', createStub(loadURLStub));
      window.createMainWindow();
      assert.deepEqual(loadURLStub.callCount, 1);
    });

    it('should set window to the center of a screen with default options', () => {
      const window = proxyquire('../../src/windows.js', createStub(simple.stub()));
      const wnd = window.createMainWindow();
      assert.deepEqual(wnd.props.x, 250);
      assert.deepEqual(wnd.props.y, 15);
    });

    it('should set window to the center of a screen with any options', () => {
      const window = proxyquire('../../src/windows.js', createStub(simple.stub()));
      const wnd = window.createMainWindow({width: 800});
      assert.deepEqual(wnd.props.x, 100);
      assert.deepEqual(wnd.props.y, 15);
    });
  });
});
