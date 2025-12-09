import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import type { LearningItem, ReviewHistory } from '../types';
import './ItemDetail.css';

export function ItemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<LearningItem | null>(null);
  const [history, setHistory] = useState<ReviewHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadItemData(id);
    }
  }, [id]);

  const loadItemData = async (itemId: string) => {
    try {
      const [itemData, historyData] = await Promise.all([
        api.getItem(itemId),
        api.getReviewHistory(itemId)
      ]);
      setItem(itemData);
      setHistory(historyData);
    } catch (err) {
      console.error('Failed to load item:', err);
      setError('Failed to load item details');
    } finally {
      setLoading(false);
    }
  };

  const handleManualReview = async () => {
    if (!item || !id) return;

    try {
      await api.manualReview(id);
      // Reload item data to show updated count
      await loadItemData(id);
    } catch (err) {
      console.error('Failed to record manual review:', err);
      alert('Failed to record manual review. Please try again.');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntil = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reviewDate = new Date(dateStr);
    reviewDate.setHours(0, 0, 0, 0);
    const diff = Math.ceil((reviewDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diff < 0) return { text: 'Overdue', className: 'overdue' };
    if (diff === 0) return { text: 'Due today', className: 'today' };
    if (diff === 1) return { text: 'Due tomorrow', className: 'soon' };
    return { text: `Due in ${diff} days`, className: 'future' };
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading item details...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="container">
        <div className="error-state">
          <h2>Error</h2>
          <p>{error || 'Item not found'}</p>
          <Link to="/items" className="btn btn-primary">
            Back to All Items
          </Link>
        </div>
      </div>
    );
  }

  const daysUntil = getDaysUntil(item.next_review_date);

  return (
    <div className="container">
      <motion.div
        className="item-detail-page"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="detail-header">
          <Link to="/items" className="back-link">
            ← Back to All Items
          </Link>

          <div className="header-content">
            <div className="header-top">
              <span className="detail-badge">{item.subject}</span>
              <Link to={`/items/${item.id}/edit`} className="btn btn-primary">
                ✏️ Edit
              </Link>
            </div>
            <h1>{item.title}</h1>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="detail-card">
          <div className="detail-section">
            <h2>Content</h2>
            <div className="content-display">
              <p>{item.content}</p>
            </div>
          </div>

          <div className="detail-meta">
            <div className="meta-row">
              <span className="meta-label">Created:</span>
              <span className="meta-value">{formatDate(item.created_at)}</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">Last Updated:</span>
              <span className="meta-value">{formatDate(item.updated_at)}</span>
            </div>
          </div>
        </div>

        {/* Review Info Card */}
        <div className="detail-card">
          <h2>Review Information</h2>
          <div className="review-info-grid">
            <div className="info-box">
              <div className="info-icon">🔁</div>
              <div className="info-content">
                <div className="info-value">{item.review_count}</div>
                <div className="info-label">Scheduled Reviews</div>
              </div>
            </div>

            <div className="info-box">
              <div className="info-icon">📚</div>
              <div className="info-content">
                <div className="info-value">{item.manual_review_count}</div>
                <div className="info-label">Manual Reviews</div>
              </div>
            </div>

            <div className="info-box">
              <div className="info-icon">📅</div>
              <div className="info-content">
                <div className={`info-value ${daysUntil.className}`}>
                  {daysUntil.text}
                </div>
                <div className="info-label">
                  Next Review: {formatDateShort(item.next_review_date)}
                </div>
              </div>
            </div>

            <div className="info-box">
              <div className="info-icon">⏱️</div>
              <div className="info-content">
                <div className="info-value">{item.current_interval_days} days</div>
                <div className="info-label">Current Interval</div>
              </div>
            </div>
          </div>

          <div className="manual-review-section">
            <button onClick={handleManualReview} className="btn btn-secondary">
              🔄 Manual Review
            </button>
            <p className="manual-review-hint">
              Quick review without changing your schedule
            </p>
          </div>
        </div>

        {/* Review History */}
        {history.length > 0 && (
          <div className="detail-card">
            <h2>Review History</h2>
            <div className="history-timeline">
              {history.map((review, index) => (
                <motion.div
                  key={review.id}
                  className={`history-item ${review.is_manual ? 'manual' : 'scheduled'}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="history-marker">
                    <div className="marker-dot"></div>
                    {index < history.length - 1 && <div className="marker-line"></div>}
                  </div>
                  <div className="history-content">
                    <div className="history-header">
                      <div>
                        <span className="history-number">
                          {review.is_manual ? '📚 Manual Review' : `Review #${review.review_number}`}
                        </span>
                        {review.is_manual && <span className="manual-badge">MANUAL</span>}
                      </div>
                      <span className="history-date">{formatDate(review.reviewed_at)}</span>
                    </div>
                    <div className="history-details">
                      {review.is_manual ? (
                        <span className="history-interval">
                          Does not affect schedule
                        </span>
                      ) : (
                        <>
                          <span className="history-interval">
                            {review.interval_days} day interval
                          </span>
                          <span className="history-next">
                            Next: {formatDateShort(review.next_review_date)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
