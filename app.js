// index.js
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser"); // parser for post requests
const AssistantV2 = require("ibm-watson/assistant/v2"); // watson sdk
const { IamAuthenticator } = require("ibm-watson/auth");
const mongoose = require("mongoose");
const cors = require("cors");

var cfenv = require("cfenv");
var appEnv = cfenv.getAppEnv();

if (appEnv.isLocal) {
  var host = "localhost";
  var port = 3000;
} else {
  var host = appEnv.host;
  var port = appEnv.port;
}

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = require(process.env.dbConnectionString);
mongoose
  .connect(db)
  .then(() => {
    console.log("DB Connected");
  })
  .catch(e => {
    console.log(e);
  });

const messages = require("./dbRoutes/messages");
app.use("/db/messages", messages);

var assistant = new AssistantV2({
  version: "2019-02-28",
  authenticator: new IamAuthenticator({
    apikey: process.env.ASSISTANT_IAM_APIKEY
  }),
  url: process.env.ASSISTANT_URL
});

app.get("/", (req, res) => res.send("Hi There!"));

// Endpoint to be call from the client side
app.post("/api/message", function(req, res) {
  let assistantId = process.env.ASSISTANT_ID || "<assistant-id>";
  var textIn = "";

  if (req.body.input) {
    textIn = req.body.input.text;
  }

  var payload = {
    assistantId: assistantId,
    sessionId: req.body.session_id,
    input: {
      message_type: "text",
      text: textIn
    }
  };

  // Send the input to the assistant service
  assistant.message(payload, function(err, data) {
    if (err) {
      const status = err.code !== undefined && err.code > 0 ? err.code : 500;
      return res.status(status).json(err);
    }

    return res.json(data);
  });
});

app.get("/api/session", function(req, res) {
  assistant.createSession(
    {
      assistantId: process.env.ASSISTANT_ID || "{assistant_id}"
    },
    function(error, response) {
      if (error) {
        return res.send(error);
      } else {
        return res.send(response);
      }
    }
  );
});

app.listen(port, host, () => console.log("Listening on port 3000"));
