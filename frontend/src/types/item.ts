export type ItemStatus = 'Pending' | 'Active' | 'Claim Pending' | 'Returned';

export type ItemLike = {
    id: number;
    name: string;
    description?: string | null;
    category: string;
    color?: string | null;
    brand?: string | null;
    location: string;
    finder_id?: number | null;
    owner_id?: number | null;
    status?: ItemStatus;
    found_at: string | null;
    similarity_score?: number;
};