import logo from './logo.svg';
import React from 'react';
import './App.css';

function ListButton() {
  function handleList() {
    alert('You clicked list.');
  }

  return (
    <button onClick={handleList}>List</button>
  );
}

function GetButton() {
  function handleGet() {
    alert('You clicked get.');
  }

  return (
    <button onClick={handleGet}>Get</button>
  );
}

function UpdateButton() {
  function handleUpdate() {
    alert('You clicked update.');
  }

  return (
    <button onClick={handleUpdate}>Update</button>
  );
}

function CreateButton() {
  function handleCreate() {
    alert('You clicked create.');
  }

  return (
    <button onClick={handleCreate}>Create</button>
  );
}

function DeleteButton() {
  function handleDelete() {
    alert('You clicked delete.');
  }

  return (
    <button onClick={handleDelete}>Delete</button>
  );
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h2>Adventureworks CRUD</h2>
        <ListButton />
        <GetButton />
        <UpdateButton />
        <CreateButton />
        <DeleteButton /> 
      </header>
    </div>
  );
}

export default App;
