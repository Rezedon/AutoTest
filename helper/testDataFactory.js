const faker = require("@faker-js/faker").faker;

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
