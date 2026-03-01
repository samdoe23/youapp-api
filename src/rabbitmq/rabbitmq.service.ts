import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as amqp from "amqp-connection-manager";
import { Channel, ConsumeMessage } from "amqplib";
import { MessageEvent } from "./message.event";

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.AmqpConnectionManager;
  private channel: amqp.ChannelWrapper;
  private readonly exchange = "chat_events";
  private readonly routingKey = "message.sent";

  constructor(private config: ConfigService) {}

  async onModuleInit() {
    const url = this.config.get("RABBITMQ_URL") || "amqp://localhost:5672";

    this.connection = amqp.connect([url]);

    this.channel = this.connection.createChannel({
      json: true,
      setup: async (channel: Channel) => {
        await channel.assertExchange(this.exchange, "topic", { durable: true });
        await channel.assertQueue("chat_messages", { durable: true });
        await channel.bindQueue(
          "chat_messages",
          this.exchange,
          this.routingKey,
        );
      },
    });

    await this.channel.waitForConnect();
  }

  async onModuleDestroy() {
    await this.channel.close();
    await this.connection.close();
  }

  async publishMessage(event: MessageEvent): Promise<void> {
    await this.channel.publish(
      this.exchange,
      this.routingKey,
      Buffer.from(JSON.stringify(event)),
      { persistent: true },
    );
  }

  async consumeMessages(
    onMessage: (event: MessageEvent) => Promise<void>,
  ): Promise<void> {
    await this.channel.addSetup(async (channel: Channel) => {
      await channel.consume(
        "chat_messages",
        async (msg: ConsumeMessage | null) => {
          if (msg) {
            try {
              const event = JSON.parse(msg.content.toString()) as MessageEvent;
              await onMessage(event);
              channel.ack(msg);
            } catch (error) {
              channel.nack(msg, false, false);
            }
          }
        },
      );
    });
  }
}
