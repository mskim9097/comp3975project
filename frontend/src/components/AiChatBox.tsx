import { useState } from 'react'
import type { AiChatResponse } from '../types/ai';

interface AiChatBoxProps {
    token: string;
    onResult: (result: AiChatResponse) => void;
}

function AiChatBox({ token, onResult }: AiChatBoxProps) {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';

    const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();

        const trimmedMessage = message.trim();

        if (!trimmedMessage) {
            setErrorMessage('Please enter a message first.');
            return;
        }

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
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to get AI response.');
            }

            onResult(data as AiChatResponse);
        } catch (error) {
            const messageText =
                error instanceof Error ? error.message : 'Something went wrong.';
            setErrorMessage(messageText);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card shadow-sm border-0">
            <div className="card-body">
                <h3 className="h5 mb-3">AI Lost Item Search</h3>
                <p className="text-muted mb-3">
                    Describe the item you lost. Include color, brand, and location if you remember them.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <textarea
                            className="form-control"
                            rows={4}
                            placeholder="Example: I lost a black wallet near SW1 yesterday."
                            value={message}
                            onChange={(event) => setMessage(event.target.value)}
                        />
                    </div>

                    {errorMessage && (
                        <div className="alert alert-danger py-2" role="alert">
                            {errorMessage}
                        </div>
                    )}

                    <button type="submit" className="btn btn-dark" disabled={loading}>
                        {loading ? 'Searching...' : 'Send'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AiChatBox;