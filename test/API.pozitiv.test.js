//ts-check

const chai = require("chai");
const validateJson = require("../shema/validationJson.js");
const { generateTestBooking } = require("../helper/testDataFactory.js");
const {
  BASE_URL,
  COMMON_HEADERS,
  AUTH_HEADERS,
} = require("../helper/const.js");
const sendRequest = require("../helper/sendRequest.js");
const bookingIdShema = require("../shema/shemaForValidate/bookingIdShema.js");
const bookingSchema = require("../shema/shemaForValidate/bookingSchema.js");

const expect = chai.expect;

describe("API Booking", () => {
  let authToken;
  let testBookingData;

  /**
   * функция создает перед тестом новый токен авторизации
   * @param {"get"|"post"|"put"|"delete"|"patch"} method - метод запроса
   * @param {string} url - url запроса
   * @param {object|null} body - объект вида {
   * username - имя пользователя
   * password - пароль пользователя
   * }
   */
  beforeAll(async () => {
    const authRes = await sendRequest("post", "/auth", {
      username: "admin",
      password: "password123",
    });
    authToken = authRes.body.token;

    testBookingData = generateTestBooking();
  });

  let createdBookingId;
  let existingLastname;
  /**
     * функция создает перед каждым тестом новое бронирование
     * @param {"get"|"post"|"put"|"delete"|"patch"} method - метод запроса
     * @param {string} url - url запроса
     * @param {object|null} body - объект вида {
     * firstname {string} - имя пользователя
     * lastname {string} - фамилия пользователя
     * totalprice {number} - общая цена
     * depositpaid {boolean} - оплата депозита
     * bookingdates {string} - даты бронирования : {
     * checkin {string} - дата заезда
     * checkout {string} - дата выезда}
     * additionalneeds {string} - дополнительные потребности
     * }
     * @param {object|null} headers - объект вида {
     *   Accept: "application/json",
  "Content-Type": "application/json",}
     */
  beforeEach(async () => {
    const createRes = await sendRequest(
      "post",
      BASE_URL,
      testBookingData,
      COMMON_HEADERS
    );
    createdBookingId = createRes.body.bookingid;
    existingLastname = testBookingData.lastname;
  });
  /**
   * функция удаляет бронь после каждого теста
   * @param {"get"|"post"|"put"|"delete"|"patch"} method - метод запроса
   * @param {string} url - url запроса
   * @param {object|null} headers - объект вида {
   * Accept - заголовок для передачи серферу формата данных,
   * Content-Type -  заголовок указывает серверу, в каком формате данные отправлены в теле запроса.,
   * Cookie - передает данные аутентификации,
   * Authorization - передает данные аутентификации
   * }
   */
  afterEach(async () => {
    // Удаляем бронь после каждого теста
    await sendRequest("delete", `${BASE_URL}/${createdBookingId}`, null, {
      ...AUTH_HEADERS,
      Authorization: `Bearer ${authToken}`,
    });
  });

  it("Получение массива ID броней", async () => {
    const res = await sendRequest("get", BASE_URL, COMMON_HEADERS);

    expect(res.status).to.equal(200);
    expect(validateJson(bookingIdShema, res.body)).to.be.true;
  }, 10000);
  //смысл наличия отдельного теста "Создание и проверка бронирования", это можно проверить в beforeEach
  // it("Создание и проверка бронирования", async () => {
  //   expect(createdBookingId).to.be.a("number");
  // });

  it("Получение конкретной брони", async () => {
    const res = await sendRequest(
      "get",
      `${BASE_URL}/${createdBookingId}`,
      null,
      COMMON_HEADERS
    );
    expect(res.status).to.equal(200);
    expect(validateJson(bookingSchema, res.body)).to.be.true;
  });

  it("Полное обновление брони (PUT)", async () => {
    const updatedData = {
      ...testBookingData,
      firstname: "UpdatedName",
    };
    const res = await sendRequest(
      "put",
      `${BASE_URL}/${createdBookingId}`,
      updatedData,
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
      patchData,
      AUTH_HEADERS
    );
    expect(res.status).to.equal(200);
    expect(validateJson(bookingSchema, res.body)).to.be.true;
    expect(res.body.firstname).to.equal("PatchedName");
    expect(res.body.lastname).to.equal(existingLastname);
  });

  it("Удаление бронирования", async () => {
    // Создаем временную бронь
    const createRes = await sendRequest(
      "post",
      BASE_URL,
      testBookingData,
      COMMON_HEADERS
    );
    const tempBookingId = createRes.body.bookingid;

    // Удаляем
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

    // Проверяем что бронь удалена
    const getRes = await sendRequest(
      "get",
      `${BASE_URL}/${tempBookingId}`,
      null,
      COMMON_HEADERS
    );
    expect(getRes.status).to.equal(404);
  });
});
