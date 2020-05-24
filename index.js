class Promise {
  constructor(execture) {
    this.status = 'pending'
    this.value = null
    this.reason = null
    let resolve = (value) => {
      if (this.status === 'pending') {
        this.value = value
        this.status = 'fulfilled'
      }
    }

    let reject = (err) => {
      if (this.status === 'pending') {
        this.value = err
        this.status = 'rejected'
      }
    }

    try {
      execture(resolve, reject)
    } catch (e) {
      reject(e)
    }
  }

  then(fulfillCb, rejectCb) {
    if ((this.status = 'fulfillCb')) {
      fulfillCb(this.value)
    } else {
      rejectCb(this.value)
    }
  }
}
