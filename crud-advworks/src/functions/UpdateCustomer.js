const { app } = require('@azure/functions');
const sql = require('mssql');
const { DefaultAzureCredential } = require('@azure/identity');

app.http('UpdateCustomer', {
    methods: ['PUT'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        //const customerID = request.query.CustomerID;
        //context.log("Req param id:", customerID);

        const {
            CustomerID, Title, NameStyle, FirstName, MiddleName, LastName, CompanyName,
            SalesPerson, EmailAddress, Phone, PasswordHash, PasswordSalt, rowguid, ModifiedDate
        } = await request.json();
        context.log("Received request data:", { CustomerID, Title, NameStyle, FirstName, MiddleName, LastName, CompanyName, SalesPerson, EmailAddress, Phone, PasswordHash, PasswordSalt, rowguid, ModifiedDate });

        if (!CustomerID || !FirstName) {
            return { status: 400, body: 'CustomerID and FirstName are required'};
        }

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

            const requestQuery = new sql.Request();
            requestQuery.input('CustomerID', sql.Int, CustomerID);
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
            requestQuery.input('rowguid', sql.UniqueIdentifier, rowguid);
            requestQuery.input('ModifiedDate', sql.DateTime, ModifiedDate);

            const query = `
                UPDATE SalesLT.Customer
                SET 
                    Title = @Title,
                    NameStyle = @NameStyle,
                    FirstName = @FirstName,
                    MiddleName = @MiddleName,
                    LastName = @LastName,
                    CompanyName = @CompanyName,
                    SalesPerson = @SalesPerson,
                    EmailAddress = @EmailAddress,
                    Phone = @Phone,
                    PasswordHash = @PasswordHash,
                    PasswordSalt = @PasswordSalt,
                    rowguid = @rowguid,
                    ModifiedDate = @ModifiedDate
                WHERE CustomerID = @CustomerID
            `;

            /* const result = await sql.query(query, {
                CustomerID, Title, NameStyle, FirstName, MiddleName, LastName, CompanyName,
                SalesPerson, EmailAddress, Phone, PasswordHash, PasswordSalt, rowguid, ModifiedDate
            }); */

            const result = await requestQuery.query(query);

            if (result.rowsAffected[0] === 0) {
                return {status: 404, body: 'Customer not found'};
            }

            return { status: 200, body: 'Customer Updated successfully'};
        } catch (err) {
            context.log('Error updating customer:', err);
            return { status: 500, body: 'Internal Server Error' };
        } finally {
            sql.close();
        }

    }
});
