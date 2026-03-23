import { logService } from '../../services/logService.js';

export const loggingMiddleware = async (ctx, next) => {
  const command = ctx.message?.text?.startsWith('/') ? ctx.message.text.split(' ')[0] : null;

  try {
    await next();
    if (command) {
      logService.command({
        updateId: ctx.update.update_id,
        chatId: ctx.chat?.id,
        userId: ctx.from?.id,
        command,
        status: 'ok'
      });
    }
  } catch (error) {
    logService.command({
      updateId: ctx.update.update_id,
      chatId: ctx.chat?.id,
      userId: ctx.from?.id,
      command,
      status: 'error',
      message: error.message
    });
    throw error;
  }
};
