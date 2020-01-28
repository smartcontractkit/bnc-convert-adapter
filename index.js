const request = require('request')

const createRequest = (input, callback) => {
  const host = 'bravenewcoin-v1.p.rapidapi.com'
  const url = 'https://' + host + '/convert'
  const coin = input.data.coin || 'ETH'
  const market = input.data.market || 'USD'
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
    json: true
  }
  request(options, (error, response, body) => {
    if (error || response.statusCode >= 400) {
      callback(response.statusCode, {
        jobRunID: input.id,
        status: 'errored',
        error: body,
        statusCode: response.statusCode
      })
    } else {
      const result = JSON.parse(body.to_quantity)
      body.result = result
      callback(response.statusCode, {
        jobRunID: input.id,
        data: body,
        result: result,
        statusCode: response.statusCode
      })
    }
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
