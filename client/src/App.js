import React, { useState } from 'react';
import axios from 'axios';
import './styles.css';

function App() {
  const API_BASE_URL = 'https://csv-data-09lr.onrender.com';
  const [selectedFile, setSelectedFile] = useState(null);
  const [tableData, setTableData] = useState(null);
  const [rowsToDisplay, setRowsToDisplay] = useState(10);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const editableFields = [
    'Status',
    'Joining Date',
    'Duration',
    'Internship Type',
    'Timing',
    'Offer letter Send',
    'Accepted Offer Letter',
    'Candidates Enrolled'
  ];
  
  // Triggered when user clicks "Edit"
  const handleEditClick = (record) => {
    setEditingRowId(record._id);
    setEditFormData(record); // copy existing row data into editFormData
  };

  const handleInputChange = (e, key) => {
    setEditFormData({
      ...editFormData,
      [key]: e.target.value
    });
  };
  
  const handleSaveClick = async (recordId) => {
    try {
      // Call your PUT endpoint with the updated data
      const response = await axios.put(
        `${API_BASE_URL}/records/${recordId}`,
        editFormData
      );
  
      // Update tableData in state:
      // Replace the old row with the new updated row
      setTableData((prevData) =>
        prevData.map((item) => (item._id === recordId ? response.data : item))
      );
  
      // Exit edit mode
      setEditingRowId(null);
    } catch (error) {
      console.error(error);
      alert('Error updating record.');
    }
  };
  

  // Handle file selection
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a CSV file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('csvFile', selectedFile);

    try {
      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert(response.data.message); // Show success message
    } catch (error) {
      console.error(error);
      alert('An error occurred while uploading the file.');
    }
  };

  // Fetch records from MongoDB
  const fetchRecords = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/records`);
      setTableData(response.data);
    } catch (error) {
      console.error(error);
      alert('An error occurred while fetching records.');
    }
  };

  return (
    <div className="container">
      <h1 className="title">MERN CSV Upload with MongoDB</h1>

      <div className="upload-section">
        <input type="file" accept=".csv" onChange={handleFileChange} />
        <button onClick={handleUpload} className="upload-button">
          Upload
        </button>
        <button onClick={fetchRecords} className="fetch-button">
          Fetch Records
        </button>
      </div>

      {tableData && (
        <div>
          <div className="row-input-section">
            <label htmlFor="rowsToDisplay">
              Rows to Display:
              <input
                id="rowsToDisplay"
                type="number"
                min="1"
                value={rowsToDisplay}
                onChange={(e) => setRowsToDisplay(e.target.value)}
              />
            </label>
          </div>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  {Object.keys(tableData[0]).map((key, idx) => (
                    <th key={idx}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
  {tableData.slice(0, rowsToDisplay).map((row, rowIndex) => (
    <tr key={rowIndex}>
      {Object.keys(row).map((key, cellIndex) => {
        // If we are currently editing this row and the column is in our editable list:
        if (editingRowId === row._id && editableFields.includes(key)) {
          return (
            <td key={cellIndex}>
              <input
                value={editFormData[key] || ''} // the updated text
                onChange={(e) => handleInputChange(e, key)}
              />
            </td>
          );
        } else {
          // Otherwise, just display the value as read-only text
          return <td key={cellIndex}>{row[key]}</td>;
        }
      })}

      {/* Edit/Save button cell */}
      <td>
        {editingRowId === row._id ? (
          <button onClick={() => handleSaveClick(row._id)}>Save</button>
        ) : (
          <button onClick={() => handleEditClick(row)}>Edit</button>
        )}
      </td>
    </tr>
  ))}
</tbody>

            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;