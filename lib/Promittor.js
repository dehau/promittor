Symbol = Symbol || (name => name + Math.random());

const LISTENERS = Symbol('listeners');
const PROMISE   = Symbol('promise');

class PromittorClass {
  constructor(buildFn) {
    this[LISTENERS] = {};
    this[PROMISE] = new Promise((res, rej) => {
      buildFn(res, rej, this);
    });
  }
  static resolve(value, eventsBuilder) {
    return new Promittor(resolve, reject, self => {
      eventsBuilder(self);
      resolve(value);
    });
  }
  static reject(value, eventsBuilder) {
    return Promittor.resolve(Promise.reject(value), eventsBuilder);
  }
  then(success, error) {
    this[PROMISE] = this[PROMISE].then(success, error);
    return this;
  }
  catch(error) {
    this[PROMISE] = this[PROMISE].then(null, error);
    return this;
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

function Promittor(buildFn = () => {}) {
  return new PromittorClass(buildFn);
}
Promittor.resolve   = PromittorClass.resolve;
Promittor.reject    = PromittorClass.reject;

export default Promittor;
export const create = Promittor;