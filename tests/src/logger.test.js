const assert = require('assert');
const simple = require('simple-mock');
const proxyquire = require('proxyquire').noCallThru();

let fileProps = {};
const createStub = (info) => ({
  winston: {
    Logger: function Logger() {
      this.info = info;
      return this;
    },
    transports: {
      Console: function Console() {
        return this;
      },
      File: function File(props) {
        fileProps = props;
        return this;
      }
    }
  }
});

let env;

describe('Logger', () => {
  beforeEach(() => {
    env = process.env.NODE_ENV;
  });

  afterEach(() => {
    process.env.NODE_ENV = env;
  });

  it('should use different files for development and production envs', () => {
    const infoStub = simple.stub();

    process.env.NODE_ENV = 'development';
    proxyquire('../../src/logger.js', createStub(infoStub));
    const fileDevelopment = fileProps.filename;
    assert.deepEqual(infoStub.callCount, 1);

    process.env.NODE_ENV = 'production';
    proxyquire('../../src/logger.js', createStub(infoStub));
    const fileProduction = fileProps.filename;
    assert.deepEqual(infoStub.callCount, 2);

    assert.notEqual(fileDevelopment, fileProduction);
  });
});
