const chai = require("chai");
const validateJson = require("./shema/validationJson.js");
const { generateTestBooking } = require("./helper/testDataFactory");
const {
  bookingSchema,
  bookingIdShema,
} = require("./shema/shemaForValidate.js");
const { BASE_URL, COMMON_HEADERS, AUTH_HEADERS } = require("./helper/const");
const sendRequest = require("./helper/sendRequest");

const expect = chai.expect;

describe("API Booking", () => {
  let authToken;
  let testBookingData;

  // Подготовка данных перед всеми тестами
  beforeAll(async () => {
    // Получаем токен авторизации
    const authRes = await sendRequest("post", "/auth", {
      username: "admin",
      password: "password123",
    });
    authToken = authRes.body.token;

    // Генерируем тестовые данные
    testBookingData = generateTestBooking();
  });

  describe("Работа с бронированиями", () => {
    let createdBookingId;

    beforeEach(async () => {
      // Создаем новую бронь перед каждым тестом
      const createRes = await sendRequest(
        "post",
        BASE_URL,
        testBookingData,
        COMMON_HEADERS
      );
      createdBookingId = createRes.body.bookingid;
    });

    afterEach(async () => {
      // Удаляем бронь после каждого теста
      await sendRequest("delete", `${BASE_URL}/${createdBookingId}`, null, {
        ...AUTH_HEADERS,
        Authorization: `Bearer ${authToken}`,
      });
    });

    it.only("Получение массива ID броней", async () => {
      const res = await sendRequest("get", BASE_URL);
      console.log(res.body);

      expect(res.status).to.equal(200);
      expect(validateJson(bookingIdShema, res.body)).to.be.true;
    });

    it("Создание и проверка бронирования", async () => {
      expect(createdBookingId).to.be.a("number");
    });

    it("Получение конкретной брони", async () => {
      const res = await sendRequest(
        "get",
        `${BASE_URL}/${createdBookingId}`,
        null
      );
      console.log(createdBookingId);

      expect(res.status).to.equal(200);
      expect(validateJson(bookingSchema, res.body)).to.be.true;
    });

    it("Полное обновление брони (PUT)", async () => {
      const updatedData = { ...testBookingData, firstname: "UpdatedName" };
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
    });
  });

  describe("Удаление бронирования", () => {
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
        { ...AUTH_HEADERS, Authorization: `Bearer ${authToken}` }
      );

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
});

describe("Пинг", () => {
  it("Проверка работоспособности", async () => {
    const res = await sendRequest("get", "/ping");
    expect(res.status).to.equal(201);
  });
});
