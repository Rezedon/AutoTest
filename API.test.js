const request = require("supertest");

const URL = "https://restful-booker.herokuapp.com";

const agent = request(URL);

describe("API Book", () => {
  it("Проверка авторизации и получения токена", async () => {
    try {
      const response = await agent
        .post("/auth")
        .send({
          username: "admin",
          password: "password123",
        })
        .expect(200);
      // console.log(response.body);
    } catch (error) {
      console.error("Ошибка:", error);
    }
  });

  it("Получение массива ID бронь книг", async () => {
    try {
      const response = await agent.get("/booking").expect(200);
      expect(Array.isArray(response.body)).toBe(true);
      const data = response.body;
      data.forEach((item) => {
        expect(item).toHaveProperty("bookingid");
        expect(typeof item.bookingid).toBe("number");
      });
    } catch (error) {
      console.error("Ошибка:", error);
    }
  });

  it("Получение конкретной брони книги", async () => {
    try {
      const response = await agent
        .get("/booking/456")
        .set("Accept", "application/json")
        .expect(200);
      expect(typeof response.body).toBe("object");
    } catch (error) {
      console.error("Ошибка:", error);
    }
  });

  it("Создание бронирования книги", async () => {
    try {
      const response = await agent
        .post("/booking")
        .set("Accept", "application/json")
        .set("Content-Type", "application/json")
        .send({
          firstname: "Rezeda",
          lastname: "Poludova",
          totalprice: 11111111,
          depositpaid: true,
          bookingdates: {
            checkin: "2018-01-01",
            checkout: "2019-01-01",
          },
          additionalneeds: "Breakfast",
        })
        .expect(200);
      // console.log(response.body);
    } catch (error) {
      console.error("Ошибка:", error);
    }
  });

  it("Изменение бронирования книги полное PUT", async () => {
    try {
      const response = await agent
        .put("/booking/1488")
        .set("Accept", "application/json")
        .set("Content-Type", "application/json")
        .set("Cookie", "token=abc123")
        .set("Authorization", "Basic YWRtaW46cGFzc3dvcmQxMjM=")
        .send({
          firstname: "NeRezeda",
          lastname: "NePoludova",
          totalprice: 2222222,
          depositpaid: true,
          bookingdates: {
            checkin: "2018-01-01",
            checkout: "2019-01-01",
          },
          additionalneeds: "Breakfast",
        })
        .expect(200);
      //console.log(response.body);
    } catch (error) {
      console.error("Ошибка:", error);
    }
  });

  it("Изменение бронирования книги частичное PATCH", async () => {
    try {
      const response = await agent
        .patch("/booking/1")
        .set("Accept", "application/json")
        .set("Content-Type", "application/json")
        .set("Cookie", "token=abc123")
        .set("Authorization", "Basic YWRtaW46cGFzc3dvcmQxMjM=")
        .send({
          firstname: "Rezeda",
          lastname: "Poludova",
        })
        .expect(200);
      //console.log(response.body);
    } catch (error) {
      console.error("Ошибка:", error);
    }
  });

  it("Удаление бронирования книги", async () => {
    try {
      const response = await agent
        .delete("/booking/46")
        .set("Cookie", "token=abc123")
        .set("Authorization", "Basic YWRtaW46cGFzc3dvcmQxMjM=")
        .expect(201);
    } catch (error) {
      console.error("Ошибка:", error);
    }
  });
});

describe("Пинг", () => {
  it("Проверка работоспособности", async () => {
    try {
      const response = await agent.get("/ping").expect(201);
    } catch (error) {
      console.error("Ошибка:", error);
    }
  });
});
