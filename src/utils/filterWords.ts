import { getServerConfig } from '@/config/server';
import { UserMessageContentPart } from '@/types/openai/chat';

export const isMessageAllowed = (message: string | UserMessageContentPart[]): boolean => {
  const { PROHIBITED_WORDS } = getServerConfig();
  const prohibitedWords = PROHIBITED_WORDS.toLowerCase().split(',');

  // 检查字符串中是否包含禁止的词汇
  const checkString = (text: string) =>
    !prohibitedWords.some((word) => text.toLowerCase().includes(word));

  // 如果 message 是字符串，直接检查
  if (typeof message === 'string') {
    return checkString(message);
  } else {
    // 如果 message 是 UserMessageContentPart[] 类型，遍历每个部分进行检查
    return message.every((part) => {
      // 假设 UserMessageContentPart 类型有一个 text 属性，您需要根据实际类型进行调整
      if (typeof part === 'object' && 'text' in part) {
        return checkString(part.text);
      }
      return true; // 如果 part 不包含 text 属性，假设它是允许的
    });
  }
};
