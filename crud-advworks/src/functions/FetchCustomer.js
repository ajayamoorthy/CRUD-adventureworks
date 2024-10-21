const { app } = require('@azure/functions');
const sql = require('mssql');

app.http('FetchCustomer', {
    methods: ['GET'],
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
            await sql.connect('Server=tcp:sqlserver-reactproject.database.windows.net,1433;Initial Catalog=adventureworks-aj;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;Authentication=Active Directory Managed Identity;');
            
            //query the database for the customer by CustomerID
            const result = await sql.query`SELECT * FROM SalesLT.Customer WHERE CustomerID = ${customerID}`;

            //either return customer or error
            if (result.recordset.length > 0) {
                return { status: 200, body: result.recordset[0]};
            } else {
                return { status: 404, body: 'Customer not found'};
            }

        } catch (err) {
            //handle other errors
            context.log('[FetchCustomer.js] Database error: ', err);
            return { status: 500, body: 'Internal Server Error'};
        } finally {
            //close sql connection
            sql.close();
        }

    }
});

/* 
module.exports = async function (context, req) {
  const customerID = req.params.id;  //the ID is passed as a URL parameter

  try {
    //connect to your SQL database
    await sql.connect('Server=tcp:sqlserver-reactproject.database.windows.net,1433;Initial Catalog=adventureworks-aj;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;Authentication="Active Directory Default";');

    //query the database for the customer by CustomerID
    const result = await sql.query`SELECT * FROM Customer WHERE CustomerID = ${customerID}`;

    if (result.recordset.length > 0) {
      //return the customer data as JSON if found
      context.res = {
        status: 200,
        body: result.recordset[0] 
      };
    } else {
      //if no customer is found, return a 404 response
      context.res = {
        status: 404,
        body: "Customer not found"
      };
    }
  } catch (err) {
    //if there is an error with the database connection or query
    context.res = {
      status: 500,
      body: `Error fetching customer: ${err.message}`
    };
  } finally {
    //close the SQL connection after the query is done
    sql.close();
  }
}; */
