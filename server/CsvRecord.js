// server/CsvRecord.js
const mongoose = require('mongoose');

// Define a schema for dynamic CSV data
const CsvRecordSchema = new mongoose.Schema({}, { strict: false });

// Remove _id and __v when converting to JSON
CsvRecordSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('CsvRecord', CsvRecordSchema);