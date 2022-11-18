const { Schema, model } = require('mongoose');

const customerSchema = new Schema(
  {
    fullname: {
      type: String,
      required: true,
      lowecase: true,
    },
    gender: {
      type: String,
      required: true,
    },
    phone_number: {
      type: String,
      required: true,
    },
    meter_number: {
      type: String,
      required: true,
    },
    location: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Location',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = new model('Customer', customerSchema);
