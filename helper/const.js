const faker = require("@faker-js/faker").faker;

const BASE_URL = "/booking";
const COMMON_HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
};
const AUTH_HEADERS = {
  ...COMMON_HEADERS,
  Cookie: "token=abc123",
  Authorization: "Basic YWRtaW46cGFzc3dvcmQxMjM=",
};

const bookingData = {
  firstname: faker.person.firstName(),
  lastname: faker.person.lastName(),
  totalprice: faker.finance.amount(),
  depositpaid: faker.datatype.boolean(),
  bookingdates: {
    checkin: faker.date.past().toISOString().split("T")[0],
    checkout: faker.date.future().toISOString().split("T")[0],
  },
  additionalneeds: faker.lorem.word(),
};

const updatedData = {
  firstname: faker.person.firstName(),
  lastname: faker.person.lastName(),
  totalprice: faker.finance.amount(),
  depositpaid: faker.datatype.boolean(),
  bookingdates: {
    checkin: faker.date.past().toISOString().split("T")[0],
    checkout: faker.date.future().toISOString().split("T")[0],
  },
  additionalneeds: faker.lorem.word(),
};

const patchData = {
  firstname: faker.person.firstName(),
  lastname: faker.person.lastName(),
};
module.exports = {
  BASE_URL,
  COMMON_HEADERS,
  AUTH_HEADERS,
  bookingData,
  updatedData,
  patchData,
};
