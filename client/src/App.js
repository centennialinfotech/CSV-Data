// client/src/App.js
import React, { useState } from 'react';
import axios from 'axios';
import './styles.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [rowsToDisplay, setRowsToDisplay] = useState(10);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const API_BASE_URL = 'https://csv-data-09lr.onrender.com'; // Deployed backend URL

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
      fetchRecords(); // Refresh the table data
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

  // Handle edit button click
  const handleEditClick = (record) => {
    setEditingRowId(record.id); // Assuming 'id' is the unique identifier
    setEditFormData(record);
  };

  // Handle input changes in edit mode
  const handleInputChange = (e, fieldName) => {
    setEditFormData({
      ...editFormData,
      [fieldName]: e.target.value
    });
  };

  // Handle save button click
  const handleSaveClick = async (recordId) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/records/${recordId}`, editFormData);
      // Update tableData with the updated record
      setTableData((prevData) =>
        prevData.map((record) => (record.id === recordId ? response.data : record))
      );
      setEditingRowId(null); // Exit edit mode
    } catch (error) {
      console.error(error);
      alert('An error occurred while updating the record.');
    }
  };

  // Handle delete button click
  const handleDeleteClick = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/records/${recordId}`);
      // Remove the deleted record from tableData
      setTableData((prevData) => prevData.filter((record) => record.id !== recordId));
    } catch (error) {
      console.error(error);
      alert('An error occurred while deleting the record.');
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

      {tableData.length > 0 && (
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
                    <th key={idx} className={key === 'Email' ? 'email-column' : ''}>
                      {key}
                    </th>
                  ))}
                  <th className="actions-column">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tableData.slice(0, rowsToDisplay).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.entries(row).map(([key, value], cellIndex) => (
                      <td key={cellIndex} className={key === 'Email' ? 'email-column' : ''}>
                        {editingRowId === row.id && editableFields.includes(key) ? (
                          <input
                            type="text"
                            value={editFormData[key] || ''}
                            onChange={(e) => handleInputChange(e, key)}
                          />
                        ) : (
                          value
                        )}
                      </td>
                    ))}
                    <td className="actions-column">
                      {editingRowId === row.id ? (
                        <button onClick={() => handleSaveClick(row.id)} className="save-button">
                          Save
                        </button>
                      ) : (
                        <>
                          <button onClick={() => handleEditClick(row)} className="edit-button">
                            Edit
                          </button>
                          <button onClick={() => handleDeleteClick(row.id)} className="delete-button">
                            Delete
                          </button>
                        </>
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
