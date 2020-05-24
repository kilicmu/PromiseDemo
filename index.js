const STATE = {
  PENDING: 'PENDING',
  FULFILLED: 'FULFILLED',
  REJECTED: 'REJECTED',
}
class Promise {
  constructor(execute) {
    this.status = STATE.PENDING
    this.value = null
    this.reason = null
    this.fulfilledCbs = []
    this.rejectedCbs = []

    let resolve = (value) => {
      if (this.status === STATE.PENDING) {
        this.value = value
        this.status = STATE.FULFILLED
        this.fulfilledCbs.forEach((_i) => _i())
      }
    }

    let reject = (err) => {
      if (this.status === STATE.PENDING) {
        this.reason = err
        this.status = STATE.REJECTED
        this.rejectedCbs.forEach((_i) => _i())
      }
    }

    try {
      execute(resolve, reject)
    } catch (e) {
      reject(e)
    }
  }

  then(onFulfilled, onRejected) {
    /** onFulfilled和onRejected都是可选参数 */
    if (typeof onFulfilled !== 'function') {
      onFulfilled = () => this.value
    }
    if (typeof onRejected !== 'function') {
      onRejected = () => {
        throw this.reason
      }
    }
    // const _promise = new Promise((resolve, reject) => {
    if (this.status === STATE.FULFILLED) {
      onFulfilled(this.value)
    } else if (this.status === STATE.REJECTED) {
      onRejected(this.reason)
    } else {
      // 处理异步resolve
      this.fulfilledCbs.push(() => onFulfilled(this.value))
      this.rejectedCbs.push(() => onRejected(this.reason))
    }
    // })

    // return _promise
  }
}

let p1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(1)
  }, 1000)
})
p1.then((d) => {
  console.log(d)
})
