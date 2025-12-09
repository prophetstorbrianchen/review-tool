import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import type { LearningItem } from '../types';
import './EditItem.css';

export function EditItem() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    subject: '',
    title: '',
    content: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadItem(id);
    }
  }, [id]);

  const loadItem = async (itemId: string) => {
    try {
      const item = await api.getItem(itemId);
      setFormData({
        subject: item.subject,
        title: item.title,
        content: item.content
      });
    } catch (err) {
      console.error('Failed to load item:', err);
      setError('Failed to load item');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.subject.trim() || !formData.title.trim() || !formData.content.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (!id) return;

    setSubmitting(true);
    try {
      await api.updateItem(id, formData);
      navigate(`/items/${id}`);
    } catch (err) {
      setError('Failed to update item. Please try again.');
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading item...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <motion.div
        className="edit-item-page"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="edit-header">
          <Link to={`/items/${id}`} className="back-link">
            ← Back to Item Details
          </Link>
          <h1>Edit Learning Item</h1>
          <p className="subtitle">Update the content for this learning item</p>
        </div>

        <form className="edit-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="subject" className="form-label">
              Subject / Category
              <span className="required">*</span>
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              className="form-input"
              value={formData.subject}
              onChange={handleChange}
              placeholder="e.g., Python Programming, Spanish Vocabulary"
              required
            />
            <p className="form-hint">Group related items by subject for easier organization</p>
          </div>

          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Title
              <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              className="form-input"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Chapter 1: Variables and Data Types"
              required
            />
            <p className="form-hint">A brief, descriptive title for this learning item</p>
          </div>

          <div className="form-group">
            <label htmlFor="content" className="form-label">
              Content
              <span className="required">*</span>
            </label>
            <textarea
              id="content"
              name="content"
              className="form-textarea"
              value={formData.content}
              onChange={handleChange}
              placeholder="Enter the main content you want to learn and remember..."
              rows={10}
              required
            />
            <p className="form-hint">
              Update the key information you want to remember
            </p>
          </div>

          {error && (
            <div className="form-error">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(`/items/${id}`)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : '✓ Save Changes'}
            </button>
          </div>

          <div className="form-info">
            <h3>💡 Editing Tips</h3>
            <ul>
              <li>Make sure your content is clear and concise</li>
              <li>Include key points you want to remember</li>
              <li>Updates won't affect your review schedule</li>
              <li>You can edit as many times as you need</li>
            </ul>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
