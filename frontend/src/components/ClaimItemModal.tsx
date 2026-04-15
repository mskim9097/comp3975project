import { useEffect, useState } from 'react';
import type { ItemLike } from '../types/item';
import ItemCard from './ItemCard';

type User = {
    id: number;
};

type ClaimItemModalProps = {
    item: ItemLike | null;
    token: string | null;
    onClose: () => void;
    onClaimSuccess?: (itemId: number, ownerId: number) => void;
};

function ClaimItemModal({
    item,
    token,
    onClose,
    onClaimSuccess,
}: ClaimItemModalProps) {
    const [claimMessage, setClaimMessage] = useState('');
    const [isClaiming, setIsClaiming] = useState(false);
    const [claimSubmitted, setClaimSubmitted] = useState(false);

    const userString = localStorage.getItem('user');
    const currentUser: User | null = userString ? JSON.parse(userString) : null;

    useEffect(() => {
        setClaimMessage('');
        setIsClaiming(false);
        setClaimSubmitted(false);
    }, [item]);

    if (!item) {
        return null;
    }

    const handleClaimItem = async () => {
        if (!currentUser) {
            setClaimMessage('Please sign in first.');
            return;
        }

        if (claimSubmitted || isClaiming) {
            return;
        }

        try {
            setIsClaiming(true);
            setClaimMessage('');

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/items/${item.id}/claim`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: token ? `Bearer ${token}` : '',
                },
                body: JSON.stringify({
                    owner_id: currentUser.id,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setClaimMessage(data.message || 'Failed to submit claim.');
                return;
            }

            setClaimSubmitted(true);
            setClaimMessage(
                'Claim submitted. Please contact 778-123-4567 or visit SE12-325 Lost & Found Office.'
            );

            onClaimSuccess?.(item.id, currentUser.id);
        } catch (error) {
            console.error(error);
            setClaimMessage('Something went wrong while submitting your claim.');
        } finally {
            setIsClaiming(false);
        }
    };

    return (
        <div className="custom-modal-backdrop" onClick={onClose}>
            <div
                className="custom-modal-card"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                        <h2 className="item-card-title mb-1">{item.category}</h2>
                        <p className="auth-subtitle mb-0">General public item details</p>
                    </div>

                    <button
                        type="button"
                        className="btn-close"
                        onClick={onClose}
                    ></button>
                </div>

                <ItemCard item={item} />

                <div className="p-3 rounded-3 bg-light border mt-4 mb-4">
                    <p className="mb-0 text-secondary">
                        {claimSubmitted
                            ? 'Your claim has been submitted. Our Lost & Found team will review it.'
                            : 'If you believe this may be your item, submit a claim for review.'}
                    </p>
                </div>

                {claimMessage && (
                    <div
                        className={`alert mb-3 ${claimSubmitted ? 'alert-info' : 'alert-danger'
                            }`}
                    >
                        {claimMessage}
                    </div>
                )}

                <div className="d-flex justify-content-end gap-2">
                    <button
                        type="button"
                        className="btn btn-light"
                        onClick={onClose}
                    >
                        {claimSubmitted ? 'Done' : 'Close'}
                    </button>

                    {!claimSubmitted && (
                        <button
                            type="button"
                            className="btn btn-primary auth-btn px-4"
                            onClick={handleClaimItem}
                            disabled={isClaiming}
                        >
                            {isClaiming ? 'Submitting...' : 'Claim This Item'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ClaimItemModal;