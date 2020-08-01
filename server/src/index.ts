import "reflect-metadata";
import {
  getRepository,
  createConnection,
  AfterInsert,
  createQueryBuilder,
} from "typeorm";
import { Message, MessageType } from "./models/Message";
import express, { Express } from "express";
import {
  addConnection,
  removeConnection,
  pushNotificationTest,
} from "./services/pusher";
import { uuid } from "uuidv4";
import { recieve } from "./services/sms";
import cors from "cors";
const app = express();

app.use(cors());
app.use(express.json(), express.urlencoded({ extended: true }));

app.get("/webhook/twilio", (req, res) => {
  const sms = req.body;

  recieve(sms);

  res.send(`
    <?xml version="1.0" encoding="UTF-8"?>
    <Response>
    </Response>`);
});

app.get("/", (req, res) => {
  pushNotificationTest();

  res.send("ok");
});
app.post("/messages", async (req, res) => {
  const outgoingMessage = req.body;

  const [msg] = Message.create([outgoingMessage]);

  msg.type = MessageType.OUTGOING;

  msg.save();

  res.json(msg);
});

app.get("/chats", async (req, res) => {
  let serviceNumbers = await createQueryBuilder()
    .select("message")
    .from(Message, "message")
    .groupBy("chatId")
    .orderBy("createdAt", "DESC")
    .getMany();

  res.json(serviceNumbers);
});

app.get("/chats/:chatId", (req, res) => {
  // @ts-ignore

  const chatId = req.param.chatId;

  const chat = Message.find({
    chatId,
  });

  res.json(chat);
});

// chats=['a','ab','abc'] that way we know who to push to
app.get("/presence", (req, res) => {
  const query = req.query;
  console.log(query.chatIds);
  const headers = {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
  };
  res.writeHead(200, headers);
  const id = uuid();
  addConnection([], res, id);

  req.on("close", () => {
    console.log("close");
    removeConnection(id);
  });
});

// Boot it
(async function () {
  await createConnection();
  app.listen(5555, (err) => {
    if (err) throw new Error(err);
    console.log("Server is running");
  });
})();
