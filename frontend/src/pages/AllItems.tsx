import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import type { LearningItem } from '../types';
import './AllItems.css';

export function AllItems() {
  const [items, setItems] = useState<LearningItem[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedSubject]);

  const loadData = async () => {
    try {
      const [itemsData, subjectsData] = await Promise.all([
        api.getItems(selectedSubject || undefined),
        api.getSubjects()
      ]);
      setItems(itemsData.items);
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await api.deleteItem(id);
      setItems(items.filter(item => item.id !== id));
    } catch (error) {
      console.error('Failed to delete item:', error);
      alert('Failed to delete item. Please try again.');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDaysUntil = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reviewDate = new Date(dateStr);
    reviewDate.setHours(0, 0, 0, 0);
    const diff = Math.ceil((reviewDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diff < 0) return 'Overdue';
    if (diff === 0) return 'Due today';
    if (diff === 1) return 'Due tomorrow';
    return `Due in ${diff} days`;
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading your items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <motion.div
        className="all-items-page"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="items-header">
          <div>
            <h1>All Learning Items</h1>
            <p className="subtitle">Browse and manage your learning library</p>
          </div>
        </div>

        {/* Subject Filter */}
        {subjects.length > 0 && (
          <div className="filter-section">
            <label className="filter-label">Filter by Subject:</label>
            <div className="subject-pills">
              <button
                className={`subject-pill ${selectedSubject === '' ? 'active' : ''}`}
                onClick={() => setSelectedSubject('')}
              >
                All ({items.length})
              </button>
              {subjects.map(subject => (
                <button
                  key={subject}
                  className={`subject-pill ${selectedSubject === subject ? 'active' : ''}`}
                  onClick={() => setSelectedSubject(subject)}
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Items List */}
        {items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h2>No items found</h2>
            <p>
              {selectedSubject
                ? `No items in "${selectedSubject}". Try selecting a different subject.`
                : "You haven't created any learning items yet."}
            </p>
          </div>
        ) : (
          <div className="items-grid">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                className="item-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="item-header">
                  <span className="item-badge">{item.subject}</span>
                  <div className="item-actions">
                    <Link to={`/items/${item.id}`} title="View details">
                      <button className="item-action-btn item-view">
                        👁️
                      </button>
                    </Link>
                    <Link to={`/items/${item.id}/edit`} title="Edit item">
                      <button className="item-action-btn item-edit">
                        ✏️
                      </button>
                    </Link>
                    <button
                      className="item-action-btn item-delete"
                      onClick={() => handleDelete(item.id)}
                      title="Delete item"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <h3 className="item-title">{item.title}</h3>

                <p className="item-content">
                  {item.content.length > 150
                    ? item.content.substring(0, 150) + '...'
                    : item.content}
                </p>

                <div className="item-footer">
                  <div className="item-meta">
                    <span className="meta-item">
                      📅 {getDaysUntil(item.next_review_date)}
                    </span>
                    <span className="meta-item">
                      🔁 {item.review_count} reviews
                    </span>
                    {item.manual_review_count > 0 && (
                      <span className="meta-item">
                        📚 {item.manual_review_count} manual
                      </span>
                    )}
                  </div>

                  <div className="item-dates">
                    <span className="date-label">Created:</span>
                    <span>{formatDate(item.created_at)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
