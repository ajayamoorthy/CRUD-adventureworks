const { app } = require('@azure/functions');
const sql = require('mssql');
const { DefaultAzureCredential } = require('@azure/identity');

app.http('CreateCustomer', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        const newCustomer = await request.json();

        /*const {
            Title, FirstName, MiddleName, LastName, CompanyName,
            SalesPerson, EmailAddress, Phone
        } = await request.json();*/
        context.log("Received input data:", { Title, FirstName, MiddleName, LastName, CompanyName, SalesPerson, EmailAddress, Phone});

        if (!newCustomer || !newCustomer.FirstName || !newCustomer.LastName) {
            return { status: 400, body: 'Invalid customer data.' };
        }

        const PasswordHash = '0';
        const PasswordSalt = '0';
        const newRowguid = generateUUID();
        const currentDateTime = getCurrentDateTime();       
            
        try {

            const credential = new DefaultAzureCredential();
            const accessToken = await credential.getToken('https://database.windows.net/');
            await sql.connect({
                server: 'sqlserver-reactproject.database.windows.net',
                authentication: {
                    type: 'azure-active-directory-access-token',
                    options: {
                        token: accessToken.token
                    }
                },
                options: {
                    database: 'adventureworks-aj',
                    encrypt: true
                }
            });

            const result = await sql.query`
            INSERT INTO SalesLT.Customer (Title, NameStyle, FirstName, MiddleName, LastName, CompanyName, SalesPerson, EmailAddress, Phone, PasswordHash, PasswordSalt, rowguid, ModifiedDate)
            VALUES (${newCustomer.Title}, ${newCustomer.NameStyle}, ${newCustomer.FirstName}, ${newCustomer.MiddleName}, ${newCustomer.LastName}, ${newCustomer.CompanyName}, ${newCustomer.SalesPerson}, ${newCustomer.EmailAddress}, ${newCustomer.Phone}, ${PasswordHash}, ${PasswordSalt}, ${newRowguid}, ${currentDateTime});
            `;

            // Log the new Customer ID
            context.log(`New Customer ID: ${result.recordset[0].CustomerID}`);

            return { status: 201, body: { CustomerID: result.recordset[0].CustomerID } };


            /* const requestQuery = new sql.Request();
            requestQuery.input('Title', sql.VarChar, createNewCustData.Title);
            requestQuery.input('NameStyle', sql.Bit, createNewCustData.NameStyle);
            requestQuery.input('FirstName', sql.VarChar, createNewCustData.FirstName);
            requestQuery.input('MiddleName', sql.VarChar, createNewCustData.MiddleName);
            requestQuery.input('LastName', sql.VarChar, createNewCustData.LastName);
            requestQuery.input('CompanyName', sql.VarChar, createNewCustData.CompanyName);
            requestQuery.input('SalesPerson', sql.VarChar, createNewCustData.SalesPerson);
            requestQuery.input('EmailAddress', sql.VarChar, createNewCustData.EmailAddress);
            requestQuery.input('Phone', sql.VarChar, createNewCustData.Phone);
            requestQuery.input('PasswordHash', sql.VarChar, createNewCustData.PasswordHash);
            requestQuery.input('PasswordSalt', sql.VarChar, createNewCustData.PasswordSalt);
            requestQuery.input('rowguid', sql.UniqueIdentifier, createNewCustData.rowguid);
            requestQuery.input('ModifiedDate', sql.DateTime, createNewCustData.ModifiedDate); */

        } catch (err) {
            context.log.error('Create Customer failed', err);
            return { status: 500, body: 'Create Customer failed.' };
        } finally {
            await sql.close();
        }

    },
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