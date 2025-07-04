const faker = require("@faker-js/faker").faker;

/**
 * Функция генерирует тестовые данные для запросов
 * @returns - возвращает объект вида {
 *  firstname - имя пользователя,
 * lastname - фамилия пользователя,
 * totalprice - максимальная сумма,
 * depositpaid - депозит,
 * bookingdates - даты бронирования {
 *  checkin - дата заезда,
 *  checkout - дата выезда,
 *},
 *additionalneeds - дополнительные потребности,}
 */

module.exports.generateTestBooking = () => ({
  firstname: faker.person.firstName(),
  lastname: faker.person.lastName(),
  totalprice: faker.number.int({ min: 50, max: 500 }),
  depositpaid: faker.datatype.boolean(),
  bookingdates: {
    checkin: faker.date.past().toISOString().split("T")[0],
    checkout: faker.date.future().toISOString().split("T")[0],
  },
  additionalneeds: faker.lorem.word(),
});
