const STATE = {
  PENDING: 'PENDING',
  FULFILLED: 'FULFILLED',
  REJECTED: 'REJECTED',
}

const _resolve = (_promise, x, resolve, reject) => {
  let called = false
  if (_promise === x) {
    return reject(new TypeError('Chaining cycle detected for promise'))
  }

  if ((typeof x === 'object' && x != null) || typeof x === 'function') {
    try {
      let then = x.then
      if (typeof then === 'function') {
        then.call(
          x,
          (y) => {
            if (called) return
            called = true
            _resolve(_promise, y, resolve, reject)
          },
          (e) => {
            if (called) return
            called = true
            reject(e)
          }
        )
      } else {
        resolve(x)
      }
    } catch (e) {
      if (called) return
      called = true
      reject(e)
    }
  } else {
    resolve(x)
  }
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

    let reject = (e) => {
      if (this.status === STATE.PENDING) {
        this.reason = e
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

    const _promise = new Promise((resolve, reject) => {
      if (this.status === STATE.FULFILLED) {
        // 为了获取_promise
        setImmediate(() => {
          try {
            const x = onFulfilled(this.value)
            _resolve(_promise, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })
      } else if (this.status === STATE.REJECTED) {
        setImmediate(() => {
          try {
            const x = onRejected(this.reason)
            _resolve(_promise, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })
      } else {
        // 处理异步resolve/reject
        this.fulfilledCbs.push(() => {
          setImmediate(() => {
            try {
              const x = onFulfilled(this.value)
              _resolve(_promise, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          })
        })
        this.rejectedCbs.push(() => {
          setImmediate(() => {
            try {
              const x = onRejected(this.reason)
              _resolve(_promise, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          })
        })
      }
    })
    return _promise
  }
}

module.exports = Promise
