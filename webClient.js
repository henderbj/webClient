const http = require('http');
const https = require('https');

exports.getParams = function(data){
  params = "";
  for (const [key, value] of Object.entries(data)){
    joinChar = params.length ? '&' : '';
    params += joinChar + key + '=' + value;
  }
  return params;
}

exports.request =  function (options={}, callback){
  webCallback = function(res){
    const result = {};
    var body = '';

    res.on('data', function(chunk){
      body += chunk;
    });

    res.on('end', function(){
      result.body = body;
      result.headers = res.headers;
      return callback(result);
    });
  }

  if(!options.network || !Object.keys(options.network).length){
    throw new Error('options.network should be no-empty object');
  }

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
    switch(options.network.method){
      case 'GET':
      dataString = exports.getParams(options.params);
      concatChar = options.network.path.includes('?') ? '&' : '?';
      options.network.path += concatChar + dataString;
      break;
      case 'POST':
      case 'PUT':
      case 'DELETE':
      const querystring = require('querystring');
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

  request = protocol.request(options.network, webCallback);
  if(['POST', 'PUT', 'DELETE'].includes(options.network.method)){
    request.write(bodyData);
  }
  request.end();
  return request;
}