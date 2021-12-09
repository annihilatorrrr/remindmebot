import { Bot } from "grammy";
import parseTime from "human-interval";

import { TOKEN } from "./config";

const bot = new Bot(TOKEN);

const test =
  /^!remindme\s(\d{1,5}(\.\d{1,3})?\s?(s|sec|m|min|h|hr|d|day|second|seconds|minute|minutes|hour|hours|day|days)\s?)+$/;

bot.hears(test, async (ctx) => {
  if (!ctx.message?.text) return;
  if (!ctx.message.from?.username) return;
  if (!ctx.message.reply_to_message?.message_id) {
    const message = await ctx.reply("Please reply to a message!");
    setTimeout(() => {
      ctx.api
        .deleteMessage(ctx.message.chat.id, message.message_id)
        .catch(() => {});
    }, 10 * 1000);
  }
  const rawTime = ctx.message.text
    .substring(10)
    .replace(/d/g, "day")
    .replace(/\s+?(m|min)/g, " minute")
    .replace(/\s+?(s|sec)/g, " second")
    .replace(/\s+?(h|hr)/g, " hour");
  const time = parseTime(rawTime);
  if (!time) return;
  const message = await ctx.reply(`Reminder set! (${rawTime})💎`, {
    reply_to_message_id: ctx.message.message_id,
  });
  setTimeout(() => {
    ctx.api
      .deleteMessage(ctx.message.chat.id, message.message_id)
      .catch(() => {});
  }, 10 * 1000);
  setTimeout(() => {
    ctx
      .reply(`Here is your reminder! @${ctx.message.from?.username}⏰`, {
        reply_to_message_id: ctx.message.reply_to_message?.message_id,
      })
      .catch((error: Error) => console.log(error.message));
  }, time);
});

bot.catch((error) => console.error(error.message));

bot.start();
