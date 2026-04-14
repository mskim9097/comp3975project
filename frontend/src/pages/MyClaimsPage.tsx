import { useEffect, useMemo, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

type User = {
    id: number;
    first_name?: string;
    last_name?: string;
    email?: string;
};

type Item = {
    id: number;
    name: string;
    description: string | null;
    category: string;
    color: string | null;
    brand: string | null;
    location: string;
    finder_id: number | null;
    owner_id: number | null;
    status: 'pending' | 'active' | 'claim_pending' | 'returned';
    found_at: string | null;
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

function MyClaimsPage() {
    const navigate = useNavigate();

    const [items, setItems] = useState<Item[]>([]);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState('');
    const [actionMessage, setActionMessage] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);

    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    const currentUser: User | null = userString ? JSON.parse(userString) : null;

    useEffect(() => {
        if (!token || !currentUser) {
            navigate('/signin');
            return;
        }

        fetchClaims();
    }, [navigate]);

    const fetchClaims = async () => {
        try {
            setLoading(true);
            setPageError('');

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/items`, {
                headers: {
                    Accept: 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                setPageError(data.message || 'Failed to load claimed items.');
                return;
            }

            setItems(data);
        } catch (error) {
            console.error(error);
            setPageError('Something went wrong while loading your claims.');
        } finally {
            setLoading(false);
        }
    };

    const myClaims = useMemo(() => {
        if (!currentUser) {
            return [];
        }

        return items.filter(
            (item) =>
                item.status === 'claim_pending' &&
                item.owner_id === currentUser.id
        );
    }, [items, currentUser]);

    const handleOpenModal = (item: Item) => {
        setSelectedItem(item);
        setActionMessage('');
    };

    const handleCloseModal = () => {
        setSelectedItem(null);
        setActionMessage('');
    };

    const handleCancelClaim = async () => {
        if (!selectedItem) {
            return;
        }

        try {
            setIsCancelling(true);
            setActionMessage('');

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/items/${selectedItem.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: token ? `Bearer ${token}` : '',
                },
                body: JSON.stringify({
                    name: selectedItem.name,
                    description: selectedItem.description,
                    category: selectedItem.category,
                    color: selectedItem.color,
                    brand: selectedItem.brand,
                    location: selectedItem.location,
                    finder_id: selectedItem.finder_id,
                    owner_id: null,
                    status: 'active',
                    found_at: selectedItem.found_at,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setActionMessage(data.message || 'Failed to cancel claim.');
                return;
            }

            setActionMessage('Claim cancelled. The item is now visible in the public list again.');

            setItems((prevItems) =>
                prevItems.map((item) =>
                    item.id === selectedItem.id
                        ? {
                            ...item,
                            status: 'active',
                            owner_id: null,
                        }
                        : item
                )
            );
        } catch (error) {
            console.error(error);
            setActionMessage('Something went wrong while cancelling your claim.');
        } finally {
            setIsCancelling(false);
        }
    };

    return (
        <>
            <Header />

            <div className="items-page">
                <div className="container py-5">
                    <div className="text-center mb-5">
                        <h1 className="auth-title">My Claims</h1>
                        <p className="auth-subtitle">
                            Review items you have already claimed.
                        </p>
                    </div>

                    {pageError && (
                        <div className="alert alert-danger mb-4">
                            {pageError}
                        </div>
                    )}

                    {loading ? (
                        <div className="empty-items-state text-center">
                            <p className="mb-0">Loading claimed items...</p>
                        </div>
                    ) : (
                        <>
                            <div className="mb-3 text-muted">
                                {myClaims.length} claimed item{myClaims.length !== 1 ? 's' : ''}
                            </div>

                            <div className="row g-4">
                                {myClaims.length > 0 ? (
                                    myClaims.map((item) => {
                                        const icon = categoryIcons[item.category] || categoryIcons.Default;

                                        return (
                                            <div key={item.id} className="col-md-6 col-lg-4">
                                                <button
                                                    type="button"
                                                    className="item-card h-100 text-start w-100 border-0"
                                                    onClick={() => handleOpenModal(item)}
                                                >
                                                    <div className="item-icon-wrap">{icon}</div>

                                                    <h3 className="item-card-title">{item.category}</h3>

                                                    <div className="item-meta">
                                                        <p className="mb-2">
                                                            <span className="item-meta-icon">📍</span> {item.location}
                                                        </p>
                                                        <p className="mb-2">
                                                            <span className="item-meta-icon">🕒</span> {formatFoundAt(item.found_at)}
                                                        </p>
                                                        <p className="mb-0">
                                                            <span className="item-meta-icon">📌</span> Claim Pending
                                                        </p>
                                                    </div>
                                                </button>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="col-12">
                                        <div className="empty-items-state text-center">
                                            <p className="mb-0">You have no claimed items right now.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
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
                                    {(categoryIcons[selectedItem.category] || categoryIcons.Default)} {selectedItem.category}
                                </h2>
                                <p className="auth-subtitle mb-0">Your claim is currently pending review</p>
                            </div>

                            <button
                                type="button"
                                className="btn-close"
                                onClick={handleCloseModal}
                            ></button>
                        </div>

                        <div className="item-meta mb-4">
                            <p className="mb-2">
                                <span className="item-meta-icon">📍</span> {selectedItem.location}
                            </p>
                            <p className="mb-0">
                                <span className="item-meta-icon">🕒</span> {formatFoundAt(selectedItem.found_at)}
                            </p>
                        </div>

                        <div className="p-3 rounded-3 bg-light border mb-4">
                            <p className="mb-0 text-secondary">
                                If this claim was made by mistake, you can cancel it here.
                            </p>
                        </div>

                        {actionMessage && (
                            <div className="alert alert-info mb-3">
                                {actionMessage}
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
                                className="btn btn-outline-danger"
                                onClick={handleCancelClaim}
                                disabled={isCancelling}
                            >
                                {isCancelling ? 'Cancelling...' : 'Cancel Claim'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
}

export default MyClaimsPage;