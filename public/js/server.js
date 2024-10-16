//require('dotenv').config();
const express = require('express'),
      sql = require('mssql');
      //cors = require('cors');
    
const app = express();
//app.use(cors());





app.listen(5000, () =>  {
    console.log('Server running on port 5000');
});
