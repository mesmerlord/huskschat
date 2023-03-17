import { ChatCompletionRequestMessageRoleEnum } from "@/store/store";

type GetPromptProps = {
  type: "user" | "assistant" | "system" | "title";
  message: string;
};

export const getPrompt = ({ type, message }: GetPromptProps) => {
  switch (type) {
    case "user": {
      const userPrompt = {
        id: crypto.randomUUID(),
        role: ChatCompletionRequestMessageRoleEnum.USER,
        content: message,
      };
      return userPrompt;
    }
    case "assistant": {
      const assistantPrompt = {
        id: crypto.randomUUID(),
        role: ChatCompletionRequestMessageRoleEnum.ASSISTANT,
        content: message,
      };
    }
    case "system": {
      const systemPrompt = {
        id: crypto.randomUUID(),
        role: ChatCompletionRequestMessageRoleEnum.SYSTEM,
        content:
          "You are an AI model trained by OpenAI, be as concise as possible in your responses.",
      };
      return systemPrompt;
    }
    case "title": {
      const titlePrompt = {
        id: crypto.randomUUID(),
        role: ChatCompletionRequestMessageRoleEnum.SYSTEM,
        content:
          "Answer with a upto 3 word title for this chat, only the title.",
      };
      return titlePrompt;
    }
    default: {
      const defaultPrompt = {
        id: crypto.randomUUID(),
        role: ChatCompletionRequestMessageRoleEnum.SYSTEM,
        content:
          "You are an AI model trained by OpenAI, be as concise as possible in your responses.",
      };
      return defaultPrompt;
    }
  }
};
