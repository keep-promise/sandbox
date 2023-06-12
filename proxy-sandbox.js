// 代理沙箱
// 代理沙箱运用了proxy，保证了window对象的纯净，不被污染
// 代理沙箱的基本思路是：设置操作都作用于代理对象上，读取操作都从代理对象上读取，
// 如若代理对象上无此对象，则从原生window上读取。

class ProxySandbox {
  constructor() {
    const originalWindow = window;
    const fakeWindow = {};
    const proxyWindow = new Proxy(fakeWindow, {
      get(target, prop) {
        if (target.hasOwnProperty(prop)) {
          return target[prop];
        }
        return originalWindow[prop];
      },
      set(target, prop, receiver) {
        target[prop] = receiver;
        return true;
      }
    });
    this.proxy = proxyWindow;
  }

  active() {
    this.sandboxRunning = true;
  }

  inActive() {
    this.sandboxRunning = false;
  }
}

const sandboxA = new ProxySandbox();
const sandboxB = new ProxySandbox();

window.sandboxA = sandboxA;

sandboxA.active();

// 应用执行在沙箱内
// 创建出沙箱后，执行可能并不如同我们在快照沙箱中写的那样，而是：应用运行在一个沙箱构建出的一个域内，切换应用以及沙箱的激活失活操作则运行在域外。

// 这个域其实就是一个函数作用域，在这个函数作用域中，会有一个与window同名的入参，用以屏蔽全局作用域上的window对象。
((window) => {
  window.a = 'a';
  window.aa = 'aa';
})(sandboxA.proxy);

sandboxA.inActive();
sandboxB.active();

// ...

((window) => {
  window.b = 'b';
  window.bb = 'bb';
})(sandboxB.proxy);
