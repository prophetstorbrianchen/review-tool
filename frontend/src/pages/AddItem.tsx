import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import './AddItem.css';

export function AddItem() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    subject: '',
    title: '',
    content: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.subject.trim() || !formData.title.trim() || !formData.content.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      await api.createItem(formData);
      navigate('/');
    } catch (err) {
      setError('Failed to create item. Please try again.');
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="container">
      <motion.div
        className="add-item-page"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="add-header">
          <h1>Add New Learning Item</h1>
          <p className="subtitle">Create a new item to add to your spaced repetition schedule</p>
        </div>

        <form className="add-form" onSubmit={handleSubmit}>
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
              Write down the key information you want to remember. The more you write now,
              the better you'll remember later!
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
              onClick={() => navigate(-1)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Creating...' : '✓ Create Item'}
            </button>
          </div>

          <div className="form-info">
            <h3>📖 How Spaced Repetition Works</h3>
            <p>
              Your new item will be reviewed on a scientific schedule designed to maximize memory
              retention:
            </p>
            <ul>
              <li><strong>Today:</strong> Initial review (Day 0)</li>
              <li><strong>Tomorrow:</strong> Second review (Day 1)</li>
              <li><strong>In 3 days:</strong> Third review</li>
              <li><strong>In 7 days:</strong> Fourth review</li>
              <li><strong>In 30 days:</strong> Fifth review and beyond</li>
            </ul>
            <p>
              Each successful review strengthens your memory, making the knowledge stick long-term!
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
