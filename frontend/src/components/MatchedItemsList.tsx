import { useState } from 'react';
import type { MatchItem } from '../types/ai';
import type { ItemLike } from '../types/item';
import ItemCard from './ItemCard';
import ClaimItemModal from './ClaimItemModal';

interface MatchedItemsListProps {
    matches: MatchItem[];
    token: string | null;
}

function MatchedItemsList({
    matches,
    token,
}: MatchedItemsListProps) {
    const [selectedItem, setSelectedItem] = useState<ItemLike | null>(null);

    const handleOpenModal = (item: ItemLike) => {
        setSelectedItem(item);
    };

    const handleCloseModal = () => {
        setSelectedItem(null);
    };

    return (
        <>
            <div className="card shadow-sm border-0 mt-4">
                <div className="card-body">
                    <h3 className="h5 mb-3">Possible Matches</h3>

                    {matches.length === 0 ? (
                        <p className="text-muted mb-0">
                            No public matches to show yet.
                        </p>
                    ) : (
                        <div className="row g-4">
                            {matches.map((item) => (
                                <div key={item.id} className="col-md-6 col-lg-4">
                                    <ItemCard
                                        item={item}
                                        onClick={handleOpenModal}
                                        showSimilarity={true}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <ClaimItemModal
                item={selectedItem}
                token={token}
                onClose={handleCloseModal}
            />
        </>
    );
}

export default MatchedItemsList;