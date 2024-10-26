const { app } = require('@azure/functions');
const sql = require('mssql');
const { DefaultAzureCredential } = require('@azure/identity');

app.http('UpdateCustomer', {
    methods: ['PUT'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        const { CustomerID, FirstName } = await request.json();

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
                SET FirstName = @FirstName, ModifiedDate = GETDATE()
                WHERE CustomerID = @CustomerID
            `;

            const result = await sql.query(query, { CustomerID, FirstName });

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
