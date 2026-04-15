import { useEffect, useMemo, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import ItemCard from '../components/ItemCard';
import type { ItemLike } from '../types/item';

const locationOptions = [
    'All',
    '--- SW Buildings ---',
    'SW1', 'SW2', 'SW3', 'SW5', 'SW7', 'SW9', 'SW10', 'SW12', 'SW13', 'SW14', 'SW16',
    '--- SE Buildings ---',
    'SE1', 'SE2', 'SE3', 'SE4', 'SE6', 'SE8', 'SE9', 'SE10', 'SE12', 'SE14', 'SE16', 'SE30',
    '--- NE Buildings ---',
    'NE1', 'NE3', 'NE4', 'NE6', 'NE8', 'NE9', 'NE10', 'NE12',
    '--- NW Buildings ---',
    'NW1', 'NW3', 'NW4', 'NW5', 'NW6',
];

const categoryOptions = ['All', 'Wallet', 'Backpack', 'Keys', 'Phone', 'Earbuds', 'Laptop', 'ID', 'Bottle', 'Headphones', 'Others'];
const timeOptions = ['All', 'Morning', 'Afternoon', 'Evening', 'Night'];

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

function ItemsListPage() {
    const navigate = useNavigate();

    const [items, setItems] = useState<ItemLike[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedLocation, setSelectedLocation] = useState('All');
    const [selectedTime, setSelectedTime] = useState('All');
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState('');

    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');

    useEffect(() => {
        if (!token || !userString) {
            navigate('/signin');
            return;
        }

        fetchItems();
    }, [navigate, token, userString]);

    const fetchItems = async () => {
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
                setPageError(data.message || 'Failed to load items.');
                return;
            }

            setItems(data);
        } catch (error) {
            console.error(error);
            setPageError('Something went wrong while loading items.');
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = useMemo(() => {
        return items
            .filter((item) => item.status === 'active')
            .filter((item) => {
                const matchesCategory =
                    selectedCategory === 'All' || item.category === selectedCategory;

                const matchesLocation =
                    selectedLocation === 'All' || item.location === selectedLocation;

                const matchesTime =
                    selectedTime === 'All' ||
                    (item.found_at ? getTimeOfDay(item.found_at) === selectedTime : false);

                return matchesCategory && matchesLocation && matchesTime;
            });
    }, [items, selectedCategory, selectedLocation, selectedTime]);



    return (
        <>
            <Header />

            <div className="items-page">
                <div className="container py-5">
                    <div className="text-center mb-5">
                        <h1 className="auth-title">Items List</h1>
                        <p className="auth-subtitle">
                            Browse active lost items using general public details only.
                        </p>
                    </div>

                    <div className="items-filter-card mb-4">
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label text-primaryLight fw-semibold">
                                    Category
                                </label>
                                <select
                                    className="form-select custom-input"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                >
                                    {categoryOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-4">
                                <label className="form-label text-primaryLight fw-semibold">
                                    Location
                                </label>
                                <select
                                    className="form-select custom-input"
                                    value={selectedLocation}
                                    onChange={(e) => setSelectedLocation(e.target.value)}
                                >
                                    {locationOptions.map((option) => {
                                        const isGroup = option.startsWith('---');

                                        return (
                                            <option
                                                key={option}
                                                value={isGroup ? '' : option}
                                                disabled={isGroup}
                                            >
                                                {option}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            <div className="col-md-4">
                                <label className="form-label text-primaryLight fw-semibold">
                                    Time
                                </label>
                                <select
                                    className="form-select custom-input"
                                    value={selectedTime}
                                    onChange={(e) => setSelectedTime(e.target.value)}
                                >
                                    {timeOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {pageError && (
                        <div className="alert alert-danger mb-4">
                            {pageError}
                        </div>
                    )}

                    {loading ? (
                        <div className="empty-items-state text-center">
                            <p className="mb-0">Loading items...</p>
                        </div>
                    ) : (
                        <>
                            <div className="mb-3 text-muted">
                                {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} found
                            </div>

                            <div className="row g-4">
                                {filteredItems.length > 0 ? (
                                    filteredItems.map((item) => (
                                        <div key={item.id} className="col-md-6 col-lg-4">
                                            <ItemCard item={item} />
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-12">
                                        <div className="empty-items-state text-center">
                                            <p className="mb-0">No items match the selected filters.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <Footer />
        </>
    );
}

export default ItemsListPage;