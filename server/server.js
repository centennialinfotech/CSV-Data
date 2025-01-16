// server/server.js
require('dotenv').config(); // Load environment variables

const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const csvtojson = require('csvtojson');
const mongoose = require('mongoose');
const CsvRecord = require('./CsvRecord');

const app = express();

// Middleware
app.use(cors());
app.use(fileUpload());
app.use(express.json()); // Parse JSON bodies

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI;
mongoose.connect(mongoURI, {
  // useNewUrlParser: true, // Deprecated
  // useUnifiedTopology: true, // Deprecated
});
mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
}).on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

// Upload and save CSV data to MongoDB
app.post('/upload', async (req, res) => {
  try {
    if (!req.files || !req.files.csvFile) {
      return res.status(400).send('No CSV file uploaded.');
    }

    const csvFile = req.files.csvFile;
    const jsonData = await csvtojson().fromString(csvFile.data.toString('utf-8'));

    // Save the data to MongoDB
    await CsvRecord.insertMany(jsonData);

    res.json({ message: 'Data uploaded and saved to the database successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while uploading the file.');
  }
});

// Fetch all records from MongoDB, excluding _id and __v
app.get('/records', async (req, res) => {
  try {
    const records = await CsvRecord.find().select('-_id -__v');
    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while fetching records.');
  }
});

// Update a single record by ID
app.put('/records/:id', async (req, res) => {
  try {
    const recordId = req.params.id;
    const updates = req.body; // Fields to update

    const updatedRecord = await CsvRecord.findByIdAndUpdate(recordId, updates, {
      new: true, // Return the updated document
      runValidators: true, // Validate before updating
    }).select('-_id -__v');

    if (!updatedRecord) {
      return res.status(404).send('Record not found.');
    }

    res.json(updatedRecord);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating record.');
  }
});

// Delete a single record by ID
app.delete('/records/:id', async (req, res) => {
  try {
    const recordId = req.params.id;
    const deletedRecord = await CsvRecord.findByIdAndDelete(recordId);

    if (!deletedRecord) {
      return res.status(404).send('Record not found.');
    }

    res.json({ message: 'Record deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error deleting record.');
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});