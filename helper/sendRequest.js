//ts-check

const request = require("supertest");
const URL = "https://restful-booker.herokuapp.com";

const agent = request(URL);

/**
 * Универсальная функция для отправки запросов
 * @param {"get"|"post"|"put"|"delete"|"patch"} method
 * @param {string} url
 * @param {object|null} body
 * @param {object|null} headers
 * @returns {import("supertest").Test}
 */

function sendRequest(method, url, body = null, headers = null) {
  let request = agent[method](url);
  if (headers) {
    for (const header in headers) {
      request = request.set(String(header), headers[header]);
    }
  }

  if (body) {
    request = request.send(body);
  }
  return request;
}

module.exports = sendRequest;
