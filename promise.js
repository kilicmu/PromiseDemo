const status = {
  PENDING: 'PENDING',
  FULFILLED: 'FULFILLED',
  REJECTED: 'REJECTED',
}

const _resolve = (_promise, x, resolve, reject) => {
  let called = false
  if (_promise === x) {
    return reject(new TypeError('typerror:xxxxxxx'))
  }

  if ((typeof x === 'object' && x !== null) || typeof x === 'function') {
    try {
      const then = x.then
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
    this.state = status.PENDING
    this.value = null
    this.reason = null
    this.onFulfilleds = []
    this.onRejecteds = []

    const resolve = (d) => {
      if (this.state === status.PENDING) {
        this.state = status.FULFILLED
        this.value = d
        this.onFulfilleds.forEach((_i) => _i())
      }
    }

    const reject = (e) => {
      if (this.state === status.PENDING) {
        this.state = status.REJECTED
        this.reason = e
        this.onRejecteds.forEach((_i) => _i())
      }
    }
    try {
      execute(resolve, reject)
    } catch (e) {
      reject(e)
    }
  }

  then(onFulfilled, onRejected) {
    if (typeof onFulfilled !== 'function') {
      onFulfilled = () => this.value
    }
    if (typeof onRejected !== 'function') {
      onRejected = () => {
        throw this.reason
      }
    }

    const _promise = new Promise((resolve, reject) => {
      if (this.state === status.FULFILLED) {
        setImmediate(() => {
          try {
            let x = onFulfilled(this.value)
            _resolve(_promise, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })
      } else if (this.state === status.REJECTED) {
        setImmediate(() => {
          try {
            let x = onRejected(this.reason)
            _resolve(_promise, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })
      } else {
        this.onFulfilleds.push(() => {
          setImmediate(() => {
            try {
              let x = onFulfilled(this.value)
              _resolve(_promise, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          })
        })
        this.onRejecteds.push(() => {
          setImmediate(() => {
            try {
              let x = onRejected(this.reason)
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

Promise.defer = Promise.deferred = function () {
  let dfd = {}
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve
    dfd.reject = reject
  })
  return dfd
}

module.exports = Promise
