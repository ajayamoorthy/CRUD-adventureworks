const { app } = require('@azure/functions');
const sql = require('mssql');
const { DefaultAzureCredential } = require('@azure/identity');

app.http('UpdateCustomer', {
    methods: ['PUT'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        const {
            CustomerID, Title, NameStyle, FirstName, MiddleName, LastName, CompanyName,
            SalesPerson, EmailAddress, Phone, PasswordHash, PasswordSalt, rowguid, ModifiedDate
        } = await request.json();

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

            const result = await sql.query(query, {
                CustomerID, Title, NameStyle, FirstName, MiddleName, LastName, CompanyName,
                SalesPerson, EmailAddress, Phone, PasswordHash, PasswordSalt, rowguid, ModifiedDate
            });
            
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
