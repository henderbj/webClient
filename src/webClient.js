// Created by https://github.com/henderbj

const http = require('http');
const https = require('https');

exports.getParams = function(data){
  let params = '';
  for (const [key, value] of Object.entries(data)){
    const joinChar = params.length ? '&' : '';
    params += joinChar + key + '=' + value;
  }
  return params;
};

// Example Options:
// const orderOptions =  {
//   network: {
//     host: 'testnet.binance.vision',
//     path: '/api/v3/order',
//     protocol: 'https:',
//     method: 'POST'
//   },
//   params: {
//     symbol: 'LTCBTC',
//     side: 'BUY',
//     type: 'LIMIT',
//     timeInForce: 'GTC',
//     quantity: '0.1',
//     price: '0.01'
//   },
//   binance: {
//     timestamp: true,
//     signed: true,
//     keys
//   }
// }

// const getOptions =  {
//   network: {
//     host: 'postman-echo.com',
//     path: '/get',
//     protocol: 'https:',
//     method: 'GET'
//   },
//   params: {
//     symbol: 'LTCBTC',
//     interval: '15m'
//   },
//   timestamp: false,
//   signed: false,
// }
exports.request =  function (options={}, callback){
  const webCallback = function(message){
    const result = {};
    var body = '';

    message.on('data', function(chunk){
      body += chunk;
    });

    message.on('end', function(){
      result.body = body;
      result.message = message;
      return callback(result);
    });
  };

  if(!options.network || !Object.keys(options.network).length){
    throw new Error('options.network should be no-empty object');
  }
  let protocol;
  switch(options.network.protocol){
  case 'http:':
    protocol = http;
    break;
  case 'https:':
    protocol = https;
    break;
  default:
    throw new Error('protocol must be "http:" or "https:"');
  }

  if(options.params &&  Object.keys(options.params).length){
    let dataString, concatChar, querystring;
    switch(options.network.method){
    case 'GET':
      dataString = exports.getParams(options.params);
      concatChar = options.network.path.includes('?') ? '&' : '?';
      options.network.path += concatChar + dataString;
      break;
    case 'POST':
    case 'PUT':
    case 'DELETE':
      querystring = require('querystring');
      var bodyData = '';
      bodyData = querystring.stringify(options.params);
      options.network.headers = {
        ...options.network.headers,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(bodyData)
      };
      break;
    default:
      throw new Error('unknown http method');
    }
  }

  const request = protocol.request(options.network, webCallback);
  if(['POST', 'PUT', 'DELETE'].includes(options.network.method)){
    request.write(bodyData);
  }
  request.end();
  return request;
};