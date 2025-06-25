const chai = require("chai");
const faker = require("@faker-js/faker").faker;
const Ajv = require("ajv");
const ajvFormats = require("ajv-formats");

const sendRequest = require("./helper/sendRequest");

const ajv = new Ajv();
ajvFormats(ajv);

const expect = chai.expect;

describe("API Negative Book", () => {
  it("Ошибка авторизации с неверными данными", async () => {
    const response = await sendRequest("post", "/auth", {
      username: "User",
      password: "Password",
    });
    expect(response.status).to.equal(200);
  });

  it("Запрос несуществующего ID брони", async () => {
    const res = await sendRequest("get", "/booking/99999");
    expect(res.status).to.equal(404);
  });

  it("Попытка создать бронь с отсутствующими обязательными полями", async () => {
    const res = await sendRequest(
      "post",
      "/booking",
      { firstname: faker.person.firstName() },
      { Accept: "application/json", "Content-Type": "application/json" }
    );
    expect(res.status).to.equal(500);
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
