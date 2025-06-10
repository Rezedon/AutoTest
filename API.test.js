const chai = require("chai");
const faker = require("@faker-js/faker").faker;
const Ajv = require("ajv");
const ajvFormats = require("ajv-formats");
const {
  bookingId,
  bookingSchema,
  createBookingShema,
} = require("./shemaForValidate");
const sendRequest = require("./sendRequest");

const ajv = new Ajv();
ajvFormats(ajv);

function validateJson(schema, data) {
  const validate = ajv.compile(schema);
  return validate(data);
}

const expect = chai.expect;

let id;

describe("API Book", () => {
  it("Проверка авторизации и получения токена", async () => {
    const response = await sendRequest("post", "/auth", {
      username: "admin",
      password: "password123",
    });
    expect(response.status).to.equal(200);
  });

  it("Ошибка авторизации с неверными данными", async () => {
    const response = await sendRequest("post", "/auth", {
      username: "User",
      password: "Password",
    });
    expect(response.status).to.equal(401);
  });

  it("Получение массива ID бронь", async () => {
    const res = await sendRequest("get", "/booking");
    expect(res.status).to.equal(200);
    const isValid = validateJson(bookingId, res.body);
    expect(isValid).to.be.true;
  });

  it("Запрос несуществующего ID брони", async () => {
    const res = await sendRequest("get", "/booking/99999");
    expect(res.status).to.equal(404);
  });

  it("Получение конкретной брони", async () => {
    const res = await sendRequest("get", `/booking/${id}`, {
      Accept: "application/json",
    });
    expect(res.status).to.equal(200);

    const isValid = validateJson(bookingSchema, res.body);
    expect(isValid).to.be.true;
  });

  it("Создание бронирования", async () => {
    const res = await sendRequest(
      "post",
      "/booking",
      {
        firstname: faker.person.firstName(),
        lastname: faker.person.lastName(),
        totalprice: faker.finance.amount(),
        depositpaid: faker.datatype.boolean(),
        bookingdates: {
          checkin: faker.date.past().toISOString().split("T")[0],
          checkout: faker.date.future().toISOString().split("T")[0],
        },
        additionalneeds: faker.lorem.word(),
      },
      { Accept: "application/json", "Content-Type": "application/json" }
    );
    expect(res.status).to.equal(200);
    const isValid = validateJson(createBookingShema, res.body);
    expect(isValid).to.be.true;
    id = res.body.bookingid;
  });

  it("Попытка создать бронь с отсутствующими обязательными полями", async () => {
    const res = await sendRequest(
      "post",
      "/booking",
      { firstname: faker.person.firstName() },
      { Accept: "application/json", "Content-Type": "application/json" }
    );
    expect(res.status).to.equal(400);
  });

  it("Изменение бронирование полное PUT", async () => {
    const res = await sendRequest(
      "put",
      `/booking/${id}`,
      {
        firstname: faker.person.firstName(),
        lastname: faker.person.lastName(),
        totalprice: faker.finance.amount(),
        depositpaid: faker.datatype.boolean(),
        bookingdates: {
          checkin: faker.date.past().toISOString().split("T")[0],
          checkout: faker.date.future().toISOString().split("T")[0],
        },
        additionalneeds: faker.lorem.word(),
      },
      {
        Accept: "application/json",
        "Content-Type": "application/json",
        Cookie: "token=abc123",
        Authorization: "Basic YWRtaW46cGFzc3dvcmQxMjM=",
      }
    );
    expect(res.status).to.equal(200);
    const isValid = validateJson(bookingSchema, res.body);
    expect(isValid).to.be.true;
  });

  it("Изменение несуществующего бронирования полное PUT", async () => {
    const res = await sendRequest(
      "put",
      "/booking/99999",
      {
        firstname: faker.person.firstName(),
        lastname: faker.person.lastName(),
        totalprice: faker.finance.amount(),
        depositpaid: faker.datatype.boolean(),
        bookingdates: {
          checkin: faker.date.past().toISOString().split("T")[0],
          checkout: faker.date.future().toISOString().split("T")[0],
        },
        additionalneeds: faker.lorem.word(),
      },
      {
        Accept: "application/json",
        "Content-Type": "application/json",
        Cookie: "token=abc123",
        Authorization: "Basic YWRtaW46cGFzc3dvcmQxMjM=",
      }
    );
    expect(res.status).to.equal(405);
  });

  it("Изменение бронирования частичное PATCH", async () => {
    const res = await sendRequest(
      "patch",
      `/booking/${id}`,
      {
        firstname: faker.person.firstName(),
        lastname: faker.person.lastName(),
      },
      {
        Accept: "application/json",
        "Content-Type": "application/json",
        Cookie: "token=abc123",
        Authorization: "Basic YWRtaW46cGFzc3dvcmQxMjM=",
      }
    );
    expect(res.status).to.equal(200);
    const isValid = validateJson(bookingSchema, res.body);
    expect(isValid).to.be.true;
  });

  it("Удаление бронирования", async () => {
    const res = await sendRequest("delete", `/booking/${id}`, {
      Cookie: "token=<token_value>",
      Authorization: "Basic YWRtaW46cGFzc3dvcmQxMjM=",
    });
    expect(res.status).to.equal(201);
  });

  it("Удаление несуществующей брони", async () => {
    const res = await sendRequest("delete", "/booking/99999");
    expect(res.status).to.equal(403);
  });
});

describe("Пинг", () => {
  it("Проверка работоспособности", async () => {
    const res = await sendRequest("get", "/ping");
    expect(res.status).to.equal(201);
  });
});
