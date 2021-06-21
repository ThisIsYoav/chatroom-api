// import message model and validations
const { Message } = require("../models/message");

const messagesService = {
    // get old messages from db
    fetchMessages: async () => {
        // exclude socket id and __v from payload
        let messages = (await Message.find({}).select("-socketId -__v")) || [];
        return messages;
    },

    // save message to db
    saveMessage: async (messageDetails, socketId) => {
        let newMessage = new Message({
            messageText: messageDetails.messageText,
            clientName: messageDetails.clientName,
            socketId: socketId,
        });
        post = await newMessage.save();

        // pick fields from the new Message to return
        let picked = {
            _id: post._id,
            messageText: post.messageText,
            clientName: post.clientName,
            sentAt: post.sentAt,
        };

        return picked;
    },
};

module.exports = messagesService;
