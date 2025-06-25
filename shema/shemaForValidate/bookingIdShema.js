const bookingIdShema = {
  type: "array",
  items: {
    type: "object",
    properties: {
      bookingid: {
        type: "integer",
      },
    },
    required: ["bookingid"],
  },
};
module.exports = bookingIdShema;
