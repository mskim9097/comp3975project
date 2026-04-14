export interface StructuredData {
    item_type: string | null;
    category: string | null;
    color: string | null;
    brand: string | null;
    location: string | null;
    keywords: string[];
    attributes: string[];
    needs_followup: boolean;
    followup_question: string | null;
}

export interface MatchItem {
    id: number;
    name: string;
    description: string | null;
    category: string | null;
    color: string | null;
    brand: string | null;
    location: string | null;
    status: string;
    found_at: string | null;
    similarity_score: number;
    match_reasons: string[];
}

export interface AiChatResponse {
    structured_data: StructuredData;
    matches: MatchItem[];
    assistant_reply: string;
}