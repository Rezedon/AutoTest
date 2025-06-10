const request = require("supertest");
const URL = "https://restful-booker.herokuapp.com";

const agent = request(URL);

function sendRequest(method, url, body = {}, headers = {}) {
  let request = agent[method](url);
  for (const header in headers) {
    request = request.set(String(header), headers[header]);
  }
  if (["post", "put", "patch"].includes(method.toLowerCase())) {
    request = request.send(body);
  }
  return request;
}

module.exports = sendRequest;
