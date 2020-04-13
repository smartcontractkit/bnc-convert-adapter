const rp = require('request-promise')
const retries = process.env.RETRIES || 3
const delay = process.env.RETRY_DELAY || 1000
const timeout = process.env.TIMEOUT || 1000

const requestRetry = (options, retries) => {
  return new Promise((resolve, reject) => {
    const retry = (options, n) => {
      return rp(options)
        .then(response => {
          if (response.body.error) {
            if (n === 1) {
              reject(response.body)
            } else {
              setTimeout(() => {
                retries--
                retry(options, retries)
              }, delay)
            }
          } else {
            return resolve(response)
          }
        })
        .catch(error => {
          if (n === 1) {
            reject(error.body)
          } else {
            setTimeout(() => {
              retries--
              retry(options, retries)
            }, delay)
          }
        })
    }
    return retry(options, retries)
  })
}

const validateInput = (input) => {
  return new Promise((resolve, reject) => {
    if (typeof input.id === 'undefined') {
      input.id = '1'
    }
    if (typeof input.data === 'undefined') {
      reject(new Error('No data supplied'))
    }
    resolve(input)
  })
}

const createRequest = (input, callback) => {
  validateInput(input)
    .then(input => {
      const host = 'bravenewcoin-v1.p.rapidapi.com'
      const url = 'https://' + host + '/convert'
      const coin = input.data.base || input.data.from || input.data.coin || ''
      const market = input.data.quote || input.data.to || input.data.market || ''
      const queryObj = {
        qty: 1,
        from: coin,
        to: market
      }
      const options = {
        url: url,
        headers: {
          'x-rapidapi-host': host,
          'x-rapidapi-key': process.env.API_KEY
        },
        qs: queryObj,
        json: true,
        timeout,
        resolveWithFullResponse: true
      }
      requestRetry(options, retries)
        .then(response => {
          const result = JSON.parse(response.body.to_quantity)
          response.body.result = result
          callback(response.statusCode, {
            jobRunID: input.id,
            data: response.body,
            result,
            statusCode: response.statusCode
          })
        })
        .catch(error => {
          callback(500, {
            jobRunID: input.id,
            status: 'errored',
            error,
            statusCode: 500
          })
        })
    })
    .catch(error => {
      callback(500, {
        jobRunID: input.id,
        status: 'errored',
        error: error.message,
        statusCode: 500
      })
    })
}

exports.gcpservice = (req, res) => {
  createRequest(req.body, (statusCode, data) => {
    res.status(statusCode).send(data)
  })
}

exports.handler = (event, context, callback) => {
  createRequest(event, (statusCode, data) => {
    callback(null, data)
  })
}

exports.handlerv2 = (event, context, callback) => {
  createRequest(JSON.parse(event.body), (statusCode, data) => {
    callback(null, {
      statusCode: statusCode,
      body: JSON.stringify(data),
      isBase64Encoded: false
    })
  })
}

module.exports.createRequest = createRequest
