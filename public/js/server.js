require('dotenv').config();
const express = require('express'),
      sql = require('mssql');
      //cors = require('cors');
    
const app = express();
//app.use(cors());

const config = {
    user: 'b8555f10-1bdc-47ed-a61f-86f02ae6d4d6',
    password: 'Hgame$2016',
    server: 'sqlserver-reactproject.database.windows.net',
    database: 'adventureworks-aj',
};

app.get('/api/data', async (req, res) => {
    try {
        await sql.connect(config);
        const result = await sql.query('SELECT TOP (100) FROM SalesLT.Customer');
        res.send(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database connection error');
    }
});

app.listen(5000, () =>  {
    console.log('Server running on port 5000');
});
