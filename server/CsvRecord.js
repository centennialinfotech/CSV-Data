const mongoose = require('mongoose');

// Define a schema for dynamic CSV data
const CsvRecordSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model('CsvRecord', CsvRecordSchema);