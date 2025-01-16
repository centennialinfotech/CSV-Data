const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const csvtojson = require('csvtojson');
require('dotenv').config();
const mongoose = require('mongoose');
const CsvRecord = require('./CsvRecord');

const app = express();
app.use(cors());
app.use(fileUpload());
app.use(express.json());

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/csvDataDB';
mongoose.connect(mongoURI, {
  //useNewUrlParser: true,
  //useUnifiedTopology: true,
});

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
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

// Fetch all records from MongoDB
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
      const updates = req.body; // key-value pairs to update
  
      // Update the record in MongoDB and return the new version
      const updatedRecord = await CsvRecord.findByIdAndUpdate(recordId, updates, {
        new: true, // returns the updated document
      });
  
      res.json(updatedRecord);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error updating record.');
    }
  });
  

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
