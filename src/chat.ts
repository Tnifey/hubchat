export type ModelOptions = {
    num_ctx: number;
    repeat_last_n: number;
}

export type ChatMessage = {
    role: string;
    content: string;
    images?: string[];
};

export type ChatConfig = {
    endpoint?: string;
    model: string;
    messages?: ChatMessage[],
    onChunk?: (chunk: string) => any;
    options?: ModelOptions;
};

export async function streamChat(config: ChatConfig): Promise<ChatMessage> {
    const {
        endpoint = 'http://localhost:11434/api/chat',
        model,
        messages = [],
        options = {
            num_ctx: 4096,
            repeat_last_n: -1,
        },
        onChunk = () => { },
    } = config;

    const chat = await fetch(endpoint, {
        method: 'post',
        body: JSON.stringify({
            model,
            messages,
            options: {
                num_ctx: 4096,
                repeat_last_n: -1,
                ...options,
            },
        }),
    });

    const reader = chat.body?.getReader();
    const decoder = new TextDecoder();

    return new Promise((resolve) => {
        let content = '';
        reader.read().then(function processText({ done, value }) {
            if (done || !value) {
                console.log('Chat stream ended', done, value);
                return resolve({ role: 'assistant', content });
            }
            const strings = decoder.decode(value, { stream: true }).split('\n');
            try {
                const chunk = strings
                    .map((s) => s && JSON.parse(s))
                    .filter(Boolean)
                    .map((data) => data?.message?.content || '')
                    .join('');
                content += chunk;
                if (onChunk(chunk)) return resolve({ role: 'assistant', content });
            } catch (e) {
                console.error(e);
                console.log('Error parsing JSON', strings);
                throw e;
            }
            return reader.read().then(processText);
        });
    });
}
