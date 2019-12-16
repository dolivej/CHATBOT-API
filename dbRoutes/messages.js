const express = require("express");
const router = express.Router();

// Message Model
const Message = require("../models/messages");

// @route GET db/messages
// @desc Get all messages
// @access Public
router.get("/", (req, res) => {
  Message.find()
    .sort({ date: -1 })
    .then(messages => res.json(messages));
});

// @route POST db/messages
// @desc Create a Post
// @access Public
router.post("/", (req, res) => {
  const newMessage = new Message({
    message: req.body.message
  });
  newMessage.save().then(message => res.json(message));
});

module.exports = router;
