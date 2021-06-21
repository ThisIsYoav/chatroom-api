const express = require("express");
const app = express();
const server = require("http").createServer(app);
const mongoose = require("mongoose");
const messagesService = require("./services/messages");
// import message and user validations
const { validateMessage, validateSender } = require("./models/message");

const io = require("socket.io")(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

//connect to db
mongoose
    .connect("mongodb://localhost/chatroom-api", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
    })
    .then(() => console.log("Connected to MongoDB..."))
    .catch((err) => console.error("Could not connect to MongoDB..."));

/* app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
}); */

// middleware for validating new user connections
io.use((socket, next) => {
    // make sure there's a client name
    const { clientName } = socket.handshake.auth;
    if (!clientName) return;

    // validate client name
    const { error } = validateSender({ clientName });
    if (error) return;
    next();
});

// define socket connections
io.on("connection", async (socket) => {
    const socketId = socket.id;

    // fetch old messages and emit to new socket client
    const oldMessages = await messagesService.fetchMessages();
    socket.emit("connectedToApi", oldMessages);

    // socket listener for new messages
    socket.on("messageFromClient", async (messageDetails, callback) => {
        // validate incoming message with Joi
        const { error } = validateMessage({
            ...messageDetails,
            socketId: socketId,
        });
        if (error) callback({ error });

        // save message to db and emit to all sockets
        let savedMessage = await messagesService.saveMessage(
            messageDetails,
            socketId
        );
        io.sockets.emit("messageFromApi", savedMessage);
    });

    socket.on("disconnect", (reason) => {
        console.log(`Client ${socket.id} disconnected, reason: ${reason}`);
    });
});

const port = 3901;

server.listen(port, () => console.log(`listening on port ${port}!`));
