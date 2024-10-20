const { app } = require('@azure/functions');
const sql = require('mssql');

app.http('DeleteCustomer', {
    methods: ['DELETE'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        const customerID = request.query.get('CustomerID');

        //handle requests w/o customer ids
        if (!customerID) {
            return { status: 400, body: 'CustomerID is required'};
        }

        try {
            //connect to database
            await sql.connect('Server=tcp:sqlserver-reactproject.database.windows.net,1433;Initial Catalog=adventureworks-aj;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;Authentication="Active Directory Default";');

            //try to delete
            const result = await sql.query`DELETE FROM SalesLT.Customer WHERE CustomerID = ${customerID}`;

            if (result.rowsAffected[0] === 0) {
                return { status: 404, body: 'Customer not found'};
            } else {
                return { status: 200, body: 'Customer deleted successfully'};
            }
        } catch (err) {
            context.log('[DeleteCustomer.js] Database error: ', err);
            return { status: 500, body: 'Internal Server Error'};
        } finally {
            sql.close();
        }

    }
});
