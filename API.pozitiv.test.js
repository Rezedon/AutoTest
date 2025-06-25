//ts-check

const chai = require("chai");
const validateJson = require("./shema/validationJson.js");
const { generateTestBooking } = require("./helper/testDataFactory.js");
const { BASE_URL, COMMON_HEADERS, AUTH_HEADERS } = require("./helper/const.js");
const sendRequest = require("./helper/sendRequest.js");
const bookingIdShema = require("./shema/shemaForValidate/bookingIdShema.js");
const bookingSchema = require("./shema/shemaForValidate/bookingSchema.js");

const expect = chai.expect;

/**
 * Данные для создания бронирования
 * @typedef {object} typeBookingData
 * @property {string} firstname
 * @property {string} lastname
 * @property {number} totalprice
 * @property {boolean} depositpaid
 * @property {object} bookingdates
 * @property {string} bookingdates.checkin
 * @property {string} bookingdates.checkout
 * @property {string} additionalneeds
 */

/**
 * общие заголовки
 * @typedef {object} typeCommonHeaders
 * @property {string} Accept
 * @property {string} Content-Type
 */

/**
 * Заголовки авторизации
 * @typedef {object} typeAuthHeaders
 * @property {string} Accept
 * @property {string} Content-Type
 * @property {string} Cookie
 * @property {string} Authorization
 */

describe("API Booking", () => {
  let authToken;
  let testBookingData;

  beforeAll(async () => {
    const authRes = await sendRequest("post", "/auth", {
      /**
       * @type {{username: string, password: string}}
       */
      username: "admin",
      password: "password123",
    });
    authToken = authRes.body.token;

    testBookingData = generateTestBooking();
  });

  describe("Работа с бронированиями", () => {
    let createdBookingId;

    beforeEach(async () => {
      const createRes = await sendRequest(
        "post",
        BASE_URL,
        /**
         * @type {typeBookingData}
         */
        testBookingData,
        /**
         * @type {typeCommonHeaders}
         */
        COMMON_HEADERS
      );
      createdBookingId = createRes.body.bookingid;
    });

    afterEach(async () => {
      // Удаляем бронь после каждого теста
      await sendRequest("delete", `${BASE_URL}/${createdBookingId}`, null, {
        /**
         * @type {typeAuthHeaders}
         */
        ...AUTH_HEADERS,
        Authorization: `Bearer ${authToken}`,
      });
    });

    it("Получение массива ID броней", async () => {
      const res = await sendRequest(
        "get",
        BASE_URL,
        /**
         * @type {typeCommonHeaders}
         */
        COMMON_HEADERS
      );

      expect(res.status).to.equal(200);
      expect(validateJson(bookingIdShema, res.body)).to.be.true;
    });
    //смысл наличия отдельного теста "Создание и проверка бронирования", это можно проверить в beforeEach
    // it("Создание и проверка бронирования", async () => {
    //   expect(createdBookingId).to.be.a("number");
    // });

    it("Получение конкретной брони", async () => {
      const res = await sendRequest(
        "get",
        `${BASE_URL}/${createdBookingId}`,
        null,
        /**
         * @type {typeCommonHeaders}
         */
        COMMON_HEADERS
      );
      expect(res.status).to.equal(200);
      expect(validateJson(bookingSchema, res.body)).to.be.true;
    });

    it("Полное обновление брони (PUT)", async () => {
      const updatedData = {
        /**
         * @type {typeBookingData}
         */
        ...testBookingData,
        firstname: "UpdatedName",
      };
      const res = await sendRequest(
        "put",
        `${BASE_URL}/${createdBookingId}`,
        /**
         * @type {typeBookingData}
         */
        updatedData,
        /**
         * @type {typeAuthHeaders}
         */
        AUTH_HEADERS
      );
      expect(res.status).to.equal(200);
      expect(validateJson(bookingSchema, res.body)).to.be.true;
      expect(res.body.firstname).to.equal("UpdatedName");
    });

    it("Частичное обновление брони (PATCH)", async () => {
      const patchData = { firstname: "PatchedName" };
      const res = await sendRequest(
        "patch",
        `${BASE_URL}/${createdBookingId}`,
        /**
         * @type {{firstname: string}}
         */
        patchData,
        /**
         * @type {typeAuthHeaders}
         */
        AUTH_HEADERS
      );
      expect(res.status).to.equal(200);
      expect(validateJson(bookingSchema, res.body)).to.be.true;
      expect(res.body.firstname).to.equal("PatchedName");
    });
  });

  describe("Удаление бронирования", () => {
    it("Удаление бронирования", async () => {
      // Создаем временную бронь
      const createRes = await sendRequest(
        "post",
        BASE_URL,
        /**
         * @type {typeBookingData}
         */
        testBookingData,
        /**
         * @type {typeCommonHeaders}
         */
        COMMON_HEADERS
      );
      const tempBookingId = createRes.body.bookingid;

      // Удаляем
      const deleteRes = await sendRequest(
        "delete",
        `${BASE_URL}/${tempBookingId}`,
        null,
        {
          /**
           * @type {typeAuthHeaders}
           */
          ...AUTH_HEADERS,
          Authorization: "Basic YWRtaW46cGFzc3dvcmQxMjM=",
        }
      );

      expect(deleteRes.status).to.equal(201);

      // Проверяем что бронь удалена
      const getRes = await sendRequest(
        "get",
        `${BASE_URL}/${tempBookingId}`,
        null,
        /**
         * @type {typeCommonHeaders}
         */
        COMMON_HEADERS
      );
      expect(getRes.status).to.equal(404);
    });
  });
});

describe("Пинг", () => {
  it("Проверка работоспособности", async () => {
    const res = await sendRequest("get", "/ping");
    expect(res.status).to.equal(201);
  });
});
