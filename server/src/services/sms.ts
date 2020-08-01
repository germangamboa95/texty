import twilio, { Twilio } from "twilio";
import { Message, MessageType } from "../models/Message";

const accountSid = "ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"; // Your Account SID from www.twilio.com/console
const authToken = "your_auth_token"; // Your Auth Token from www.twilio.com/console

const client: Twilio = new Twilio(accountSid, authToken);

// client.messages
//   .create({
//     body: "Hello from Node",
//     to: "+12345678901", // Text this number
//     from: "+12345678901", // From a valid Twilio number
//   })
//   .then((message) => console.log(message.sid));

export const send = async (message: Message) => {
  const sentMessage = await client.messages.create({
    body: message.contents,
    to: message.externalNumber,
    from: message.serviceNumber,
  });

  await Message.update(message, {
    sentAt: new Date(),
  });
};

export const recieve = async (smsMessage: any) => {
  const message = new Message();

  message.type = MessageType.INCOMING;
  message.contents = smsMessage.Body;
  message.externalNumber = smsMessage.From;
  message.serviceNumber = smsMessage.To;

  message.save();
};
