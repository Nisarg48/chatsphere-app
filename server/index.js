require('dotenv').config();
const express = require('express');
const ConnectDB = ('./DBConnection/connect');
const app = express();

const port = process.env.PORT || 3000;

async function startServer() 
{
    try 
    {
        // Connect to the database
        await ConnectDB(process.env.CONNECTION_STRING);
        console.log('Connected to MongoDB');

        // Middleware
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } 
    catch (error) 
    {
        console.error('Error starting server:', error);
        process.exit(1);
    }
}

startServer()  ;