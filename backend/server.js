const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server,{
    cors: {
        origin: "http://localhost:3000", // Your React app's URL
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
        credentials: true, // Allow credentials if needed
    }
});

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/socket_sample', { useNewUrlParser: true, useUnifiedTopology: true });

const phoneSchema = new mongoose.Schema({
    brand: { type: String, required: true },
    year: { type: Number, required: true, min: 1000, max: new Date().getFullYear() },
    price: { type: Number, required: true, min: 0 }
});

const Phone = mongoose.model('Phone', phoneSchema);

// Fetch all phones when a new client connects
io.on('connection', async (socket) => {
    console.log('A user connected');

    // Send existing phones to the newly connected client
    const phones = await Phone.find();
    socket.emit('loadPhones', phones);

    // Handle adding a new phone
    socket.on('addPhone', async (newPhoneData) => {
        try {
            // Validate incoming data
            const newPhone = new Phone(newPhoneData);
            await newPhone.validate(); // Mongoose validation

            await newPhone.save();
            io.emit('newPhone', newPhone); // Emit new phone to all clients
        } catch (error) {
            socket.emit('error', { message: error.message }); // Emit error to client
        }
    });
});

// Start the server
server.listen(4000, () => {
    console.log('Server is running on http://localhost:4000');
});
