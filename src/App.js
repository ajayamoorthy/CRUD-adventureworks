import React, { useState } from 'react';
import './App.css';

function App() {
  const [customer, setCustomer] = useState(null);
  const [customerID, setCustomerID] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [updatedCustomer, setUpdatedCustomer] = useState({});
  const [newCustomer, setNewCustomer] = useState({
    Title: '',
    NameStyle: false,
    FirstName: '',
    MiddleName: '',
    LastName: '',
    CompanyName: '',
    SalesPerson: '',
    EmailAddress: '',
    Phone: '',
  });

  function generateUUID() { // Public Domain/MIT
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0;
        var v = (c === 'x') ? r : (r & 0x3) | 0x8; // Added parentheses for clarity
        return v.toString(16);
    });
  }


  function getCurrentDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
  
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
  }

  async function fetchAllCustomers() {
    const endpoint = `/data-api/rest/Customer`;
    const response = await fetch(endpoint);

    if (!response.ok) {
      console.error('Fetch error:', response.statusText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.value;

  }

  async function fetchCustomer(id) {
    const endpoint = `https://crud-advworks.azurewebsites.net/api/fetchcustomer?CustomerID=${id}`;
    console.log(`Fetching customer with ID: ${id}`);

    const response = await fetch(endpoint);
    console.log("Raw response:", response);


    if (!response.ok) {
      console.error('Fetch error: ', response.statusText);
      throw new Error(`HTTP Error! status: ${response.status}`);
    }

    const result = await response.json();
    console.table(result);
    console.log('API Response:', result);
    setCustomer(result);
    setIsEditing(false);
    
  }

  async function handleUpdate() {

    if (!customer || !customer.CustomerID) {
      alert('No customer selected for update.');
      return;
    }

    const updatedData = { 
      CustomerID: customer.CustomerID,
      Title: customer.Title,   
      NameStyle: customer.NameStyle,        
      FirstName: updatedCustomer.FirstName || customer.FirstName, //use the updated value or original if unchanged
      MiddleName: customer.MiddleName,
      LastName: customer.LastName,
      CompanyName: customer.CompanyName,
      SalesPerson: customer.SalesPerson,
      EmailAddress: customer.EmailAddress,
      Phone: customer.Phone,
      PasswordHash: customer.PasswordHash,
      PasswordSalt: customer.PasswordSalt,
      rowguid: customer.rowguid,
      ModifiedDate: getCurrentDateTime(),
    };

    const endpoint = `https://crud-advworks.azurewebsites.net/api/updatecustomer`;
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    });

    if(response.ok) {
      fetchCustomer(customer.CustomerID);
    } else {
      alert("Error updating customer.");
    }
  }

  async function handleDelete() {
    const endpoint = `https://crud-advworks.azurewebsites.net/api/deletecustomer?CustomerID=${customerID}`
    const response = await fetch(endpoint, {
      method: 'DELETE',
    }); 

    if(response.ok) {
      alert('Customer deleted successfully!');
      setCustomer(null);
    } else {
      alert('Error deleting customer.');
    }
  }

  async function handleCreate() {

    const newRowguid = generateUUID();
    const currentDateTime = getCurrentDateTime();

    const allCustomers = await fetchAllCustomers();

    const maximumID = allCustomers.reduce((max, customer) => {
      return Math.max(max, customer.CustomerID);
    }, 0);

    const newID = maximumID + 1;

    const createUserData = {
      ...newCustomer,
      CustomerID: newID,
      PasswordHash: '0',
      PasswordSalt: '0',
      rowguid: newRowguid,
      ModifiedDate: currentDateTime,
    };

    const endpoint = `/data-api/rest/Customer`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createUserData),
    });

    const result = await response.json();

    if (response.ok) {
      setCustomer(result);
      fetchCustomer(newID);
      //console.log(`Customer created successfully. New Customer ID: ${result.FirstName}`);
      console.log(`New Customer ID: ${newID}`);
    } else {
      alert('Error creating customer.');
    }

  }

  return (
    <div className='App'>
      <header className='App-header'>
        <h2>Adventureworks CRUD</h2>

        <div>
          <input
            type="text"
            placeholder="Enter CustomerID"
            value={customerID}
            onChange={(e) => setCustomerID(e.target.value)}
          />
          <button onClick={() => fetchCustomer(customerID)}>Get Customer</button>
        </div>

        <div>
          <h3>Create New Customer</h3>
          <input
            type="text"
            placeholder="Title"
            value={newCustomer.Title}
            onChange={(e) => setNewCustomer({ ...newCustomer, Title: e.target.value })}
          />
          <input
            type="text"
            placeholder="First Name"
            value={newCustomer.FirstName}
            onChange={(e) => setNewCustomer({ ...newCustomer, FirstName: e.target.value })}
          />
          <input
            type="text"
            placeholder="Middle Name"
            value={newCustomer.MiddleName}
            onChange={(e) => setNewCustomer({ ...newCustomer, MiddleName: e.target.value })}
          />
          <input
            type="text"
            placeholder="Last Name"
            value={newCustomer.LastName}
            onChange={(e) => setNewCustomer({ ...newCustomer, LastName: e.target.value })}
          />
          <input
            type="text"
            placeholder="Company Name"
            value={newCustomer.CompanyName}
            onChange={(e) => setNewCustomer({ ...newCustomer, CompanyName: e.target.value })}
          />
          <input
            type="text"
            placeholder="Sales Person"
            value={newCustomer.SalesPerson}
            onChange={(e) => setNewCustomer({ ...newCustomer, SalesPerson: e.target.value })}
          />
          <input
            type="text"
            placeholder="Email Address"
            value={newCustomer.EmailAddress}
            onChange={(e) => setNewCustomer({ ...newCustomer, EmailAddress: e.target.value })}
          />
          <input
            type="text"
            placeholder="Phone"
            value={newCustomer.Phone}
            onChange={(e) => setNewCustomer({ ...newCustomer, Phone: e.target.value })}
          />
          <button onClick={handleCreate}>Create Customer</button>
        </div>

        {customer && (
          <div>
            <h3>Customer Details:</h3>
            <table>
              <tbody>
                <tr>
                  <td>Customer ID:</td>
                  <td>{customer.CustomerID}</td>
                </tr>
                <tr>
                  <td>Title:</td>
                  <td>{customer.Title}</td>
                </tr>
                <tr>
                  <td>First Name:</td>
                  <td>{customer.FirstName}</td>
                </tr>
                <tr>
                  <td>Middle Name:</td>
                  <td>{customer.MiddleName}</td>
                </tr>
                <tr>
                  <td>Last Name:</td>
                  <td>{customer.LastName}</td>
                </tr>
                <tr>
                  <td>Company Name:</td>
                  <td>{customer.CompanyName}</td>
                </tr>
                <tr>
                  <td>Sales Person:</td>
                  <td>{customer.SalesPerson}</td>
                </tr>
                <tr>
                  <td>Email Address:</td>
                  <td>{customer.EmailAddress}</td>
                </tr>
                <tr>
                  <td>Phone:</td>
                  <td>{customer.Phone}</td>
                </tr>
              </tbody>
            </table>

            {isEditing ? (
              <div>
                <h4>Edit Customer:</h4>
                <input
                  type="text"
                  placeholder="First Name"
                  value={updatedCustomer.FirstName || ''}
                  onChange={(e) => setUpdatedCustomer({...updatedCustomer, FirstName: e.target.value})}
                />
                {/* Add more input fields for other editable properties */}
                <button onClick={handleUpdate}>Update</button>
                <button onClick={() => setIsEditing(false)}>Cancel</button>
              </div>
            ) : (
              <div>
                <button onClick={() => setIsEditing(true)}>Edit</button>
                <button onClick={handleDelete}>Delete</button>
              </div>
            )}
          </div>
        )}

      </header>
    </div>
  )

}

export default App;
