// Вспомогательная функция для создания брони
const chai = require("chai");
const expect = chai.expect;
const faker = require("@faker-js/faker").faker;
const { createBookingShema } = require("../shema/shemaForValidate");
const sendRequest = require("./sendRequest");
const { BASE_URL, COMMON_HEADERS } = require("./const");
const validateJson = require("../shema/validationJson");
const { generateTestBooking } = require("./testDataFactory");

async function createBooking() {
  const bookingData = generateTestBooking();

  const res = await sendRequest("post", BASE_URL, bookingData, COMMON_HEADERS);
  expect(res.status).to.equal(200);
  expect(validateJson(createBookingShema, res.body)).to.be.true;
  return res.body.bookingid;
}
module.exports = createBooking;
