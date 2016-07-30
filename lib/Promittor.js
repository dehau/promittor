Symbol = Symbol || (name => name + Math.random());

const LISTENERS = Symbol('listeners');
const PROMISE   = Symbol('promise');

class Promittor {
  constructor(buildFn = () => {}) {
    this[LISTENERS] = {};
    this[PROMISE] = new Promise((res, rej) => {
      buildFn(res, rej, this);
    });
  }
  static create(buildFn) {
    return new Promittor(buildFn);
  }
  static resolve(value) {
    return new Promittor(resolve => resolve(value));
  }
  static reject(value) {
    return Promittor.resolve(Promise.reject(value));
  }
  then(success, error) {
    var promittor = Promittor.resolve(this[PROMISE].then(success, error));
    promittor[LISTENERS] = this[LISTENERS];
    this.emit = (event, ...data) => promittor.emit(event, ...data);
    return promittor;
  }
  catch(error) {
    return this.then(null, error);
  }
  on(event, cb) {
    let listeners = (this[LISTENERS][event] || []);
    this[LISTENERS][event] = listeners.concat([cb]);
    return this;
  }
  off(event, cb) {
    let listeners = (this[LISTENERS][event] || []);
    this[LISTENERS][event] = listeners.filter(listener => listener !== cb);
    return this;
  }
  emit(event, ...data) {
    let listeners = (this[LISTENERS][event] || []);
    /* [async]
     * wait for event loop's queue emptiness so
     * new Promittor((res, rej, self) => { self.emit('initial'); })
     *   .on('initial', initialHandler) will call initialHandler
     */
    setTimeout(() => listeners.forEach(cb => cb(...data)));
    return this;
  }
  addEventListener(event, cb) { return this.on(event, cb); }
  removeEventListener(event, cb) { return this.off(event, cb); }
}

export default Promittor;
export const create  = Promittor.create;
export const resolve = Promittor.resolve;
export const reject  = Promittor.reject;
