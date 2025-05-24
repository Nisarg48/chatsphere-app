require('dotenv').config();
const express = require('express');
const connectDB = require('./DBConnection/connect');
const app = express();
const routes = require('./Routes/routes');
const cors = require('cors');

const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/chat-sphere', routes);

async function startServer() 
{
    try 
    {
        // Connect to the database
        await connectDB(process.env.CONNECTION_STRING);
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