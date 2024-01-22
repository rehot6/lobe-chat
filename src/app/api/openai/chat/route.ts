import { OpenAIChatStreamPayload } from '@/types/openai/chat';
import { isMessageAllowed } from '@/utils/filterWords';

import { getPreferredRegion } from '../../config';
import { createBizOpenAI } from '../createBizOpenAI';
import { createChatCompletion } from './createChatCompletion';

export const runtime = 'edge';
export const preferredRegion = getPreferredRegion();

export const POST = async (req: Request) => {
  const payload = (await req.json()) as OpenAIChatStreamPayload;

  const openaiOrErrResponse = createBizOpenAI(req, payload.model);

  // if resOrOpenAI is a Response, it means there is an error,just return it
  if (openaiOrErrResponse instanceof Response) return openaiOrErrResponse;

  const lastMessage = payload.messages.at(-1);
  const userInput = lastMessage ? lastMessage.content : undefined;
  if (userInput !== undefined && !isMessageAllowed(userInput)) {
    // 如果消息包含不当内容，返回错误信息
    return new Response(
      JSON.stringify({
        error: '发送的内容中包含敏感词汇',
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
        status: 200,
      },
    );
  }

  // 如果消息检查通过，继续处理并生成回复
  return createChatCompletion({ openai: openaiOrErrResponse, payload });
};
