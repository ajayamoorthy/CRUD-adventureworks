const { app } = require('@azure/functions');
const sql = require('mssql');
const { DefaultAzureCredential } = require('@azure/identity');

app.http('CreateCustomer', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);     
            
        try {

            //const newCustomer = await request.json();

            const {
                Title, NameStyle = 0, FirstName, MiddleName, LastName, CompanyName,
                SalesPerson, EmailAddress, Phone
            } = await request.json();
            context.log("Received input data:", { Title, FirstName, MiddleName, LastName, CompanyName, SalesPerson, EmailAddress, Phone});

            if (!FirstName || !LastName) {
                return { status: 400, body: 'Invalid customer data.' };
            }

            const PasswordHash = '0';
            const PasswordSalt = '0';
            const newRowguid = generateUUID();
            const currentDateTime = getCurrentDateTime();  

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
            context.log("[CreateCustomer.js]: Database accessed.")

            const requestQuery = new sql.Request();
            requestQuery.input('Title', sql.VarChar, Title);
            requestQuery.input('NameStyle', sql.Bit, NameStyle);
            requestQuery.input('FirstName', sql.VarChar, FirstName);
            requestQuery.input('MiddleName', sql.VarChar, MiddleName);
            requestQuery.input('LastName', sql.VarChar, LastName);
            requestQuery.input('CompanyName', sql.VarChar, CompanyName);
            requestQuery.input('SalesPerson', sql.VarChar, SalesPerson);
            requestQuery.input('EmailAddress', sql.VarChar, EmailAddress);
            requestQuery.input('Phone', sql.VarChar, Phone);
            requestQuery.input('PasswordHash', sql.VarChar, PasswordHash);
            requestQuery.input('PasswordSalt', sql.VarChar, PasswordSalt);
            requestQuery.input('rowguid', sql.UniqueIdentifier, newRowguid);
            requestQuery.input('ModifiedDate', sql.DateTime, currentDateTime); 

            context.log("[CreateCustomer.js]: requestQuery created.");

            const query = `
                INSERT INTO SalesLT.Customer (
                    Title,
                    NameStyle,
                    FirstName,
                    MiddleName,
                    LastName,
                    CompanyName,
                    SalesPerson,
                    EmailAddress,
                    Phone,
                    PasswordHash,
                    PasswordSalt,
                    rowguid,
                    ModifiedDate
                ) VALUES (
                    @Title,
                    @NameStyle,
                    @FirstName,
                    @MiddleName,
                    @LastName,
                    @CompanyName,
                    @SalesPerson,
                    @EmailAddress,
                    @Phone,
                    @PasswordHash,
                    @PasswordSalt,
                    @rowguid,
                    @ModifiedDate
                );
                
                SELECT SCOPE_IDENTITY() AS CustomerID;
            `;

            context.log("[CreateCustomer.js]: Query const created");

            const result = await requestQuery.query(query);
            context.log("[CreateCustomer.js]: Processed query request ");

            // Log the new Customer ID
            context.log(`New Customer ID: ${result.recordset[0].CustomerID}`);

            return { 
                status: 201, 
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({ CustomerID: result.recordset[0].CustomerID })};


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