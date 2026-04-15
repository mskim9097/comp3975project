import { useState } from 'react';
import type { MatchItem } from '../types/ai';

type User = {
    id: number;
    first_name?: string;
    last_name?: string;
    email?: string;
};

type PublicMatchedItemsProps = {
    items: MatchItem[];
    token: string;
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

function formatFoundAt(dateString: string | null): string {
    if (!dateString) {
        return 'Time not available';
    }

    const date = new Date(dateString);
    const month = date.toLocaleString('en-US', { month: 'long' });
    const day = date.getDate();
    const timeOfDay = getTimeOfDay(dateString);

    return `${month} ${day}${getOrdinal(day)} · ${timeOfDay}`;
}

function PublicMatchedItems({
    items,
    token,
}: PublicMatchedItemsProps) {
    const [selectedItem, setSelectedItem] = useState<MatchItem | null>(null);
    const [claimMessage, setClaimMessage] = useState('');
    const [isClaiming, setIsClaiming] = useState(false);

    const userString = localStorage.getItem('user');
    const currentUser: User | null = userString ? JSON.parse(userString) : null;

    const handleOpenModal = (item: MatchItem) => {
        setSelectedItem(item);
        setClaimMessage('');
    };

    const handleCloseModal = () => {
        setSelectedItem(null);
        setClaimMessage('');
    };

    const handleClaimItem = async () => {
        if (!selectedItem || !currentUser) {
            return;
        }

        try {
            setIsClaiming(true);
            setClaimMessage('');

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/items/${selectedItem.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: token ? `Bearer ${token}` : '',
                },
                body: JSON.stringify({
                    owner_id: currentUser.id,
                    status: 'claim_pending',
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setClaimMessage(data.message || 'Failed to submit claim.');
                return;
            }

            setClaimMessage(
                'Claim submitted. Please contact 778-123-4567 or visit SE12-325 Lost & Found Office.'
            );
        } catch (error) {
            console.error(error);
            setClaimMessage('Something went wrong while submitting your claim.');
        } finally {
            setIsClaiming(false);
        }
    };

    return (
        <>
            <div className="card shadow-sm border-0 mt-4">
                <div className="card-body">
                    <h3 className="h5 mb-2">Possible Matches</h3>
                    <p className="text-muted mb-4">
                        Only general public item details are shown. If one looks like yours, submit a claim.
                    </p>

                    {items.length === 0 ? (
                        <p className="text-muted mb-0">No matching items yet.</p>
                    ) : (
                        <div className="row g-4">
                            {items.map((item) => {
                                const icon = categoryIcons[item.category || ''] || categoryIcons.Default;

                                return (
                                    <div key={item.id} className="col-md-6">
                                        <button
                                            type="button"
                                            className="item-card h-100 text-start w-100 border-0"
                                            onClick={() => handleOpenModal(item)}
                                        >
                                            <div className="item-icon-wrap">{icon}</div>

                                            <h3 className="item-card-title">
                                                {item.category || item.name || 'Item'}
                                            </h3>

                                            <div className="item-meta">
                                                <p className="mb-2">
                                                    <span className="item-meta-icon">📍</span> {item.location || 'Unknown'}
                                                </p>
                                                <p className="mb-0">
                                                    <span className="item-meta-icon">🕒</span> {formatFoundAt(item.found_at)}
                                                </p>
                                            </div>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {selectedItem && (
                <div className="custom-modal-backdrop" onClick={handleCloseModal}>
                    <div
                        className="custom-modal-card"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <h2 className="item-card-title mb-1">
                                    {(categoryIcons[selectedItem.category || ''] || categoryIcons.Default)}{' '}
                                    {selectedItem.category || selectedItem.name || 'Item'}
                                </h2>
                                <p className="auth-subtitle mb-0">General public item details</p>
                            </div>

                            <button
                                type="button"
                                className="btn-close"
                                onClick={handleCloseModal}
                            ></button>
                        </div>

                        <div className="item-meta mb-4">
                            <p className="mb-2">
                                <span className="item-meta-icon">📍</span> {selectedItem.location || 'Unknown'}
                            </p>
                            <p className="mb-0">
                                <span className="item-meta-icon">🕒</span> {formatFoundAt(selectedItem.found_at)}
                            </p>
                        </div>

                        <div className="p-3 rounded-3 bg-light border mb-4">
                            <p className="mb-0 text-secondary">
                                If you believe this may be your item, submit a claim for review.
                            </p>
                        </div>

                        {claimMessage && (
                            <div className="alert alert-info mb-3">
                                {claimMessage}
                            </div>
                        )}

                        <div className="d-flex justify-content-end gap-2">
                            <button
                                type="button"
                                className="btn btn-light"
                                onClick={handleCloseModal}
                            >
                                Close
                            </button>

                            <button
                                type="button"
                                className="btn btn-primary auth-btn px-4"
                                onClick={handleClaimItem}
                                disabled={isClaiming}
                            >
                                {isClaiming ? 'Submitting...' : 'Claim This Item'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default PublicMatchedItems;