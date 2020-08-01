import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  AfterInsert,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  BeforeInsert,
} from "typeorm";
import { uuid } from "uuidv4";

import { pushNotification } from "../services/pusher";
import { send } from "../services/sms";

export enum MessageType {
  OUTGOING = "outgoing",
  INCOMING = "incoming",
}

@Entity()
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  chatId: string;

  @Column()
  serviceNumber: string;

  @Column()
  externalNumber: string;

  @Column()
  type: MessageType;

  @Column()
  contents: string;

  @Column({ nullable: true })
  sentAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  async handleBeforeInsert() {
    const chat = await Message.findOne({
      externalNumber: this.externalNumber,
      serviceNumber: this.serviceNumber,
    });

    if (chat !== undefined) {
      this.chatId = chat.chatId;
    } else {
      this.chatId = uuid();
    }
  }

  @AfterInsert()
  handleMessageInsert() {
    if (this.type === MessageType.INCOMING) {
      pushNotification(this.chatId);
    }
    if (this.type === MessageType.OUTGOING) {
      send(this);
    }
  }
}
