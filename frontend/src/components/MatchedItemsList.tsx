import type { MatchItem, StructuredData } from '../types/ai';

interface MatchedItemsListProps {
    assistantReply: string;
    structuredData: StructuredData | null;
    matches: MatchItem[];
}

function MatchedItemsList({
    assistantReply,
    structuredData,
    matches,
}: MatchedItemsListProps) {
    return (
        <div className="card shadow-sm border-0 mt-4">
            <div className="card-body">
                <h3 className="h5 mb-3">Results</h3>

                {assistantReply && (
                    <div className="alert alert-primary">
                        <strong>AI Reply:</strong>
                        <div className="mt-2">{assistantReply}</div>
                    </div>
                )}

                {structuredData && (
                    <div className="mb-4">
                        <h4 className="h6">Extracted Search Data</h4>
                        <div className="row g-2">
                            <div className="col-md-4">
                                <div className="border rounded p-2 bg-light">
                                    <strong>Item Type:</strong> {structuredData.item_type || '-'}
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="border rounded p-2 bg-light">
                                    <strong>Category:</strong> {structuredData.category || '-'}
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="border rounded p-2 bg-light">
                                    <strong>Color:</strong> {structuredData.color || '-'}
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="border rounded p-2 bg-light">
                                    <strong>Brand:</strong> {structuredData.brand || '-'}
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="border rounded p-2 bg-light">
                                    <strong>Location:</strong> {structuredData.location || '-'}
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="border rounded p-2 bg-light">
                                    <strong>Needs Follow-up:</strong>{' '}
                                    {structuredData.needs_followup ? 'Yes' : 'No'}
                                </div>
                            </div>
                        </div>

                        {structuredData.keywords.length > 0 && (
                            <div className="mt-3">
                                <strong>Keywords:</strong>{' '}
                                {structuredData.keywords.join(', ')}
                            </div>
                        )}
                    </div>
                )}

                <h4 className="h6">Matched Items</h4>

                {matches.length === 0 ? (
                    <p className="text-muted mb-0">No matching items yet.</p>
                ) : (
                    <div className="row g-3">
                        {matches.map((item) => (
                            <div className="col-md-6" key={item.id}>
                                <div className="border rounded p-3 h-100 bg-white">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <h5 className="h6 mb-0">{item.name}</h5>
                                        <span className="badge text-bg-dark">
                                            {item.similarity_score}%
                                        </span>
                                    </div>

                                    <p className="mb-2 text-muted">
                                        {item.description || 'No description'}
                                    </p>

                                    <div className="small">
                                        <div>
                                            <strong>Category:</strong> {item.category || '-'}
                                        </div>
                                        <div>
                                            <strong>Color:</strong> {item.color || '-'}
                                        </div>
                                        <div>
                                            <strong>Brand:</strong> {item.brand || '-'}
                                        </div>
                                        <div>
                                            <strong>Location:</strong> {item.location || '-'}
                                        </div>
                                        <div>
                                            <strong>Status:</strong> {item.status}
                                        </div>
                                    </div>

                                    {item.match_reasons.length > 0 && (
                                        <div className="mt-3">
                                            {item.match_reasons.map((reason) => (
                                                <span
                                                    className="badge rounded-pill text-bg-secondary me-2"
                                                    key={`${item.id}-${reason}`}
                                                >
                                                    {reason}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MatchedItemsList;