const chai = require("chai");
const validateJson = require("../shema/validationJson.js");
const { generateTestBooking } = require("../helper/testDataFactory.js");
const {
  BASE_URL,
  COMMON_HEADERS,
  AUTH_HEADERS,
  updatedData,
} = require("../helper/const.js");
const sendRequest = require("../helper/sendRequest.js");
const bookingIdShema = require("../shema/shemaForValidate/bookingIdShema.js");
const bookingSchema = require("../shema/shemaForValidate/bookingSchema.js");

const expect = chai.expect;

describe("API Booking", () => {
  let authToken;
  let testBookingData;

  beforeAll(async () => {
    const authRes = await sendRequest("post", "/auth", {
      username: "admin",
      password: "password123",
    });
    authToken = authRes.body.token;

    testBookingData = generateTestBooking();
  });

  let createdBookingId;

  beforeEach(async () => {
    const createRes = await sendRequest(
      "post",
      BASE_URL,
      testBookingData,
      COMMON_HEADERS
    );
    createdBookingId = createRes.body.bookingid;
  });

  afterEach(async () => {
    await sendRequest("delete", `${BASE_URL}/${createdBookingId}`, null, {
      ...AUTH_HEADERS,
      Authorization: `Bearer ${authToken}`,
    });
  });

  it("Получение массива ID броней", async () => {
    const res = await sendRequest("get", BASE_URL, COMMON_HEADERS);
    expect(res.status).to.equal(200);
    const bookingIdsArray = res.body.map((booking) => booking.bookingid);
    expect(validateJson(bookingIdShema, res.body)).to.be.true;
    expect(bookingIdsArray).to.include(createdBookingId);
  }, 10000);

  it("Получение конкретной брони", async () => {
    const res = await sendRequest(
      "get",
      `${BASE_URL}/${createdBookingId}`,
      null,
      COMMON_HEADERS
    );
    expect(res.status).to.equal(200);
    expect(validateJson(bookingSchema, res.body)).to.be.true;
    expect(res.body).to.deep.equal(testBookingData);
  });

  it("Полное обновление брони (PUT)", async () => {
    const res = await sendRequest(
      "put",
      `${BASE_URL}/${createdBookingId}`,
      updatedData,
      AUTH_HEADERS
    );
    expect(res.status).to.equal(200);
    expect(validateJson(bookingSchema, res.body)).to.be.true;
    expect(res.body).to.deep.equal(updatedData);
  });

  it("Частичное обновление брони (PATCH)", async () => {
    const res = await sendRequest(
      "patch",
      `${BASE_URL}/${createdBookingId}`,
      { firstname: "PatchedName" },
      AUTH_HEADERS
    );
    expect(res.status).to.equal(200);
    expect(validateJson(bookingSchema, res.body)).to.be.true;
    expect(res.body.firstname).to.equal("PatchedName");
    expect(res.body.lastname).to.equal(testBookingData.lastname);
    expect(res.body.totalprice).to.equal(testBookingData.totalprice);
    expect(res.body.depositpaid).to.equal(testBookingData.depositpaid);
    expect(res.body.bookingdates).to.deep.equal(testBookingData.bookingdates);
    expect(res.body.additionalneeds).to.equal(testBookingData.additionalneeds);
  });

  it("Удаление бронирования", async () => {
    const createRes = await sendRequest(
      "post",
      BASE_URL,
      testBookingData,
      COMMON_HEADERS
    );
    const tempBookingId = createRes.body.bookingid;

    const deleteRes = await sendRequest(
      "delete",
      `${BASE_URL}/${tempBookingId}`,
      null,
      {
        ...AUTH_HEADERS,
        Authorization: "Basic YWRtaW46cGFzc3dvcmQxMjM=",
      }
    );
    expect(deleteRes.status).to.equal(201);
    expect(deleteRes.body).to.be.empty;

    expect(deleteRes.status).to.equal(201);

    const getRes = await sendRequest(
      "get",
      `${BASE_URL}/${tempBookingId}`,
      null,
      COMMON_HEADERS
    );
    expect(getRes.status).to.equal(404);
  });
});
