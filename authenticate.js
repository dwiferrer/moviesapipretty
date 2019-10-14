const jwtAuthz = require('express-jwt-authz');

var jwt = require('express-jwt');
var jwks = require('jwks-rsa');

exports.jwtCheck = jwt({
  secret: jwks.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: 'https://dwightferrer.auth0.com/.well-known/jwks.json'
}),
aud: 'https://test/api',
issuer: 'https://dwightferrer.auth0.com/',
algorithms: ['RS256']
});