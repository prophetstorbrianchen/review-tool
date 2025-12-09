import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import type { LearningItem } from '../types';
import './ReviewPage.css';

export function ReviewPage() {
  const [items, setItems] = useState<LearningItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    loadDueItems();
  }, []);

  const loadDueItems = async () => {
    try {
      const data = await api.getDueItems();
      setItems(data.items);
    } catch (error) {
      console.error('Failed to load due items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsReviewed = async () => {
    if (reviewing || !currentItem) return;

    setReviewing(true);
    try {
      await api.markAsReviewed(currentItem.id);

      // Move to next item
      if (currentIndex < items.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowContent(false);
      } else {
        // All done!
        setItems([]);
      }
    } catch (error) {
      console.error('Failed to mark as reviewed:', error);
      alert('Failed to mark as reviewed. Please try again.');
    } finally {
      setReviewing(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading items for review...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container">
        <div className="review-complete">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="complete-icon"
          >
            🎉
          </motion.div>
          <h1>All Done!</h1>
          <p>You've reviewed all items due today. Keep up the great work!</p>
          <div className="complete-actions">
            <Link to="/" className="btn btn-primary">
              Back to Dashboard
            </Link>
            <Link to="/add" className="btn btn-secondary">
              Add New Item
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentItem = items[currentIndex];
  const progress = ((currentIndex + 1) / items.length) * 100;

  return (
    <div className="container">
      <div className="review-page">
        {/* Progress Bar */}
        <div className="review-progress">
          <div className="progress-bar">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="progress-text">
            {currentIndex + 1} of {items.length}
          </p>
        </div>

        {/* Review Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem.id}
            className="review-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="review-header">
              <div className="review-badge">{currentItem.subject}</div>
              <div className="review-stats">
                <span>Review #{currentItem.review_count + 1}</span>
                <span className="separator">•</span>
                <span>{currentItem.current_interval_days} day interval</span>
              </div>
            </div>

            <h1 className="review-title">{currentItem.title}</h1>

            <div className="review-content-wrapper">
              <button
                className="show-content-btn"
                onClick={() => setShowContent(!showContent)}
              >
                {showContent ? '👁️ Hide Content' : '👁️ Show Content'}
              </button>

              <AnimatePresence>
                {showContent && (
                  <motion.div
                    className="review-content"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p>{currentItem.content}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="review-actions">
              <button
                className="btn btn-primary btn-large"
                onClick={handleMarkAsReviewed}
                disabled={reviewing}
              >
                {reviewing ? 'Marking as Reviewed...' : '✓ Mark as Reviewed'}
              </button>
            </div>

            <div className="review-hint">
              <p>Try to recall the content before revealing it!</p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Quick Stats */}
        <div className="review-queue">
          <h3>Coming Up:</h3>
          <div className="queue-items">
            {items.slice(currentIndex + 1, currentIndex + 4).map((item, index) => (
              <div key={item.id} className="queue-item">
                <span className="queue-number">{index + 1}</span>
                <span className="queue-subject">{item.subject}</span>
                <span className="queue-title">{item.title}</span>
              </div>
            ))}
            {items.length > currentIndex + 4 && (
              <div className="queue-more">
                +{items.length - currentIndex - 4} more
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
