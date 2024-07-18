//Expressjwt provides Express middleware for validating JWTs (JSON Web Tokens) through the jsonwebtoken module. The decoded JWT payload is available on the request object.
const { expressjwt: jwt } = require("express-jwt");

function authJwt() {
  const secret = process.env.secret;
  const api = process.env.API_URL;
  return jwt({
    secret,
    algorithms: ["HS256"],
    isRevoked: isRevoked,
  }).unless({
    path: [
      { url: /\/api\/v1\/products(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/categories(.*)/, methods: ["GET", "OPTIONS"] },
      `${api}/users/login`,
      `${api}/users/register`,
    ],
  });
}
async function isRevoked(req, payload) {
  const { payload: reqPayload } = payload;
  if (reqPayload.isAdmin == false) {
    console.log("Not Admin");
    return true;
  } else {
    console.log("Is Admin");
    return false;
  }
}
module.exports = authJwt;
