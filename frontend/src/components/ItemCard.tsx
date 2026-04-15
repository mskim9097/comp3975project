import type { ItemLike } from '../types/item';

type ItemCardProps = {
    item: ItemLike;
    onClick?: (item: ItemLike) => void;
    showSimilarity?: boolean;
};

const categoryIcons: Record<string, string> = {
    Wallet: '👛',
    Backpack: '🎒',
    Keys: '🔑',
    Phone: '📱',
    Earbuds: '🎧',
    Laptop: '💻',
    ID: '🪪',
    Bottle: '🧴',
    Headphones: '🎧',
    Others: '📦',
    Default: '📦',
};

function getTimeOfDay(dateString: string): string {
    const date = new Date(dateString);
    const hour = date.getHours();

    if (hour < 12) {
        return 'Morning';
    }

    if (hour < 17) {
        return 'Afternoon';
    }

    if (hour < 21) {
        return 'Evening';
    }

    return 'Night';
}

function getOrdinal(day: number): string {
    if (day > 3 && day < 21) {
        return 'th';
    }

    switch (day % 10) {
        case 1:
            return 'st';
        case 2:
            return 'nd';
        case 3:
            return 'rd';
        default:
            return 'th';
    }
}

export function formatFoundAt(dateString: string | null): string {
    if (!dateString) {
        return 'Time not available';
    }

    const date = new Date(dateString);
    const month = date.toLocaleString('en-US', { month: 'long' });
    const day = date.getDate();
    const timeOfDay = getTimeOfDay(dateString);

    return `${month} ${day}${getOrdinal(day)} · ${timeOfDay}`;
}

function ItemCard({
    item,
    onClick,
    showSimilarity = false,
}: ItemCardProps) {
    const icon = categoryIcons[item.category] || categoryIcons.Default;

    return (
        <button
            type="button"
            className="item-card h-100 text-start w-100 border-0"
            onClick={() => onClick?.(item)}
        >
            <div className="d-flex justify-content-between align-items-start">
                <div className="item-icon-wrap">{icon}</div>

                {showSimilarity && typeof item.similarity_score === 'number' && (
                    <span className="badge text-bg-dark">
                        {item.similarity_score}%
                    </span>
                )}
            </div>

            <h3 className="item-card-title">{item.category}</h3>

            <div className="item-meta">
                <p className="mb-2">
                    <span className="item-meta-icon">📍</span> {item.location}
                </p>
                <p className="mb-0">
                    <span className="item-meta-icon">🕒</span> {formatFoundAt(item.found_at)}
                </p>
            </div>
        </button>
    );
}

export default ItemCard;