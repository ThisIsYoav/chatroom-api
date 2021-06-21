const Joi = require("joi");
const mongoose = require("mongoose");

// define mongoose schema for db
const messageSchema = new mongoose.Schema({
    messageText: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 1000,
    },
    clientName: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 255,
    },
    socketId: {
        type: String,
        required: true,
        minlength: 20,
        maxlength: 20,
    },
    sentAt: {
        type: Date,
        default: Date.now,
    },
});

const Message = mongoose.model("Message", messageSchema);

// define schema for new messages on entry to server
function validateMessage(message) {
    const schema = Joi.object({
        messageText: Joi.string().min(1).max(1000).required(),
        clientName: Joi.string().min(1).max(255).required(),
        socketId: Joi.string().min(20).max(20).required(),
    });

    return schema.validate(message);
}

// define schema for new client login details on entry to server
function validateSender(name) {
    const schema = Joi.object({
        clientName: Joi.string().min(1).max(255).required(),
    });

    return schema.validate(name);
}

exports.Message = Message;
exports.validateMessage = validateMessage;
exports.validateSender = validateSender;
