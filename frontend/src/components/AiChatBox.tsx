import { useEffect, useRef, useState } from 'react';
import type {
    AiChatResponse,
    ChatMessage,
    StructuredData,
} from '../types/ai';

interface AiChatBoxProps {
    token: string;
    onResult: (result: AiChatResponse) => void;
}

function AiChatBox({ token, onResult }: AiChatBoxProps) {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: 'assistant',
            content: 'Tell me about the item you lost.',
        },
    ]);
    const [structuredData, setStructuredData] = useState<StructuredData | null>(null);

    const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const sendMessage = async () => {
        const trimmedMessage = message.trim();

        if (!trimmedMessage || loading) {
            return;
        }

        const nextMessages: ChatMessage[] = [
            ...messages,
            {
                role: 'user',
                content: trimmedMessage,
            },
        ];

        setMessages(nextMessages);
        setMessage('');
        setLoading(true);
        setErrorMessage('');

        try {
            const response = await fetch(`${apiBaseUrl}/api/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    message: trimmedMessage,
                    previous_structured_data: structuredData,
                    conversation_messages: nextMessages,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to get AI response.');
            }

            const result = data as AiChatResponse;

            setStructuredData(result.structured_data);
            setMessages(result.conversation_messages);
            onResult(result);
        } catch (error) {
            const text =
                error instanceof Error ? error.message : 'Something went wrong.';
            setErrorMessage(text);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        await sendMessage();
    };

    const handleKeyDown = async (
        event: React.KeyboardEvent<HTMLTextAreaElement>
    ) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            await sendMessage();
        }
    };

    return (
        <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-0 pt-4 pb-2">
                <h3 className="h5 mb-1">AI Lost Item Chat</h3>
                <p className="text-muted small mb-0">
                    Describe your lost item and answer follow-up questions.
                </p>
            </div>

            <div
                className="card-body p-0"
                style={{ height: '600px', display: 'flex', flexDirection: 'column' }}
            >
                <div
                    className="flex-grow-1 px-3 pt-3"
                    style={{
                        overflowY: 'auto',
                        backgroundColor: '#f8f9fa',
                    }}
                >
                    {messages.map((chatMessage, index) => (
                        <div
                            key={`${chatMessage.role}-${index}`}
                            className={`d-flex mb-3 ${chatMessage.role === 'user'
                                    ? 'justify-content-end'
                                    : 'justify-content-start'
                                }`}
                        >
                            <div
                                className={`px-3 py-2 rounded-4 ${chatMessage.role === 'user'
                                        ? 'bg-dark text-white'
                                        : 'bg-white border'
                                    }`}
                                style={{
                                    maxWidth: '78%',
                                    whiteSpace: 'pre-wrap',
                                }}
                            >
                                <div className="small fw-bold mb-1">
                                    {chatMessage.role === 'user' ? 'You' : 'AI'}
                                </div>
                                <div>{chatMessage.content}</div>
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="d-flex justify-content-start mb-3">
                            <div
                                className="px-3 py-2 rounded-4 bg-white border"
                                style={{ maxWidth: '78%' }}
                            >
                                <div className="small fw-bold mb-1">AI</div>
                                <div>Typing...</div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef}></div>
                </div>

                <div className="border-top p-3 bg-white">
                    {errorMessage && (
                        <div className="alert alert-danger py-2 mb-3" role="alert">
                            {errorMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="d-flex gap-2 align-items-end">
                            <textarea
                                className="form-control rounded-4"
                                rows={2}
                                value={message}
                                onChange={(event) => setMessage(event.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={loading}
                                style={{ resize: 'none' }}
                            />

                            <button
                                type="submit"
                                className="btn btn-dark rounded-4 px-4"
                                disabled={loading || !message.trim()}
                            >
                                {loading ? 'Sending...' : 'Send'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AiChatBox;