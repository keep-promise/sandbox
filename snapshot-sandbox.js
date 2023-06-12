// 快照沙箱
// 激活方法：可以获得原window对象的属性和方法，需要当前window对象变为当前应用的window对象
// 失活方法：可以获得当前应用的window对象的属性和方法，需要使当前window对象变为纯粹的window对象

const originalSnapshot = {};
const modifyPropsMap = {};

class SnapshotSandbox {
  constructor() {
    this.proxy = window;
    this.originalSnapshot = {};
    this.modifyPropsMap = {};
  }

  active() {
    // 记录当前的window对象的样子 存放在originalSnapshot上
    for(let prop in window) {
      if (window.hasOwnProperty(prop)) {
        this.originalSnapshot[prop] = window[prop];
      }
    }
     // 根据差异（modifyPropsMap）去修改window对象
     Object.keys(modifyPropsMap).forEach(prop => {
      window[prop] = this.modifyPropsMap[prop];
    });
  }

  inActive() {
    // 遍历当前window对象
    for (const prop in window) {
      if (window.hasOwnProperty(prop)) {
        // 并将这个window对象的属性内容和originalSnapshot存储的进行比对
        // 如若一致 忽略
        // 如若不一致
        if (window[prop] !==  this.originalSnapshot[prop]) {
          // 将属性-值记录至modifyPropsMap中
          this.modifyPropsMap[prop] = window[prop];
          // 然后将该属性的值还原为originalSnapshot记录的值
          window[prop] =  this.originalSnapshot[prop];
        }
      }
    }
  }

}


// 测试

function excuteAppA() {
  window.a = 'a';
  window.aa = 'aa';
}
function excuteAppB() {
  window.b = 'b';
  window.bb = 'bb';
}
function showConsole() {
  console.log(window.begin, window.a, window.aa, window.b, window.bb);
}
// begin 在挂载应用之前，可能会有其他的库在window上挂载一些内容
window.begin = 'some value';
// 创建A B应用的沙箱
const sandboxA = new SnapshotSandbox();
const sandboxB = new SnapshotSandbox();

// 看看当前window的结果
showConsole();
// 假设初始化时挂载A应用
sandboxA.active();
// 挂载完毕后，A应用可能会执行它自己的逻辑
excuteAppA();
// 看看当前window的结果
showConsole();
// 从应用A切换至B 经历A失活 B激活
sandboxA.inActive();
sandboxB.active();
// 看看当前window的结果
showConsole();
// 挂载完毕后，B应用也可能会执行它自己的逻辑
excuteAppB();
// 看看当前window的结果
showConsole();
// 从应用B切换至A 经历B失活 A激活
sandboxB.inActive();
sandboxA.active();
// 看看当前window的结果
showConsole();
