import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import type { DueItemsResponse, ReviewStats } from '../types';
import './Dashboard.css';

export function Dashboard() {
  const [dueItems, setDueItems] = useState<DueItemsResponse | null>(null);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [dueData, statsData] = await Promise.all([
        api.getDueItems(),
        api.getStats()
      ]);
      setDueItems(dueData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading your learning journey...</p>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="container">
      <motion.div
        className="dashboard"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.header className="dashboard-header" variants={itemVariants}>
          <h1>Your Learning Dashboard</h1>
          <p className="subtitle">Track your progress and stay consistent with spaced repetition</p>
        </motion.header>

        {/* Stats Grid */}
        <motion.div className="stats-grid" variants={itemVariants}>
          <div className="stat-card stat-primary">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <div className="stat-value">{dueItems?.total_due || 0}</div>
              <div className="stat-label">Due Today</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✨</div>
            <div className="stat-content">
              <div className="stat-value">{stats?.total_items || 0}</div>
              <div className="stat-label">Total Items</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <div className="stat-value">{stats?.total_reviews || 0}</div>
              <div className="stat-label">Reviews Complete</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <div className="stat-value">{stats?.items_due_this_week || 0}</div>
              <div className="stat-label">Due This Week</div>
            </div>
          </div>
        </motion.div>

        {/* Due Items Section */}
        {dueItems && dueItems.total_due > 0 ? (
          <motion.div className="due-section" variants={itemVariants}>
            <div className="section-header">
              <h2>Ready to Review</h2>
              <Link to="/review" className="btn btn-primary">
                Start Reviewing →
              </Link>
            </div>

            <div className="due-items-preview">
              {dueItems.items.slice(0, 3).map((item, index) => (
                <motion.div
                  key={item.id}
                  className="preview-card"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="preview-badge">{item.subject}</div>
                  <h3>{item.title}</h3>
                  <p className="preview-meta">
                    Review #{item.review_count + 1} • {item.current_interval_days} day interval
                  </p>
                </motion.div>
              ))}
            </div>

            {dueItems.total_due > 3 && (
              <p className="more-items">
                + {dueItems.total_due - 3} more items waiting for review
              </p>
            )}
          </motion.div>
        ) : (
          <motion.div className="empty-state" variants={itemVariants}>
            <div className="empty-icon">🎉</div>
            <h2>All caught up!</h2>
            <p>No items due for review today. Great work staying on top of your learning!</p>
            <Link to="/add" className="btn btn-primary">
              Add New Learning Item
            </Link>
          </motion.div>
        )}

        {/* By Subject Breakdown */}
        {dueItems && Object.keys(dueItems.by_subject).length > 0 && (
          <motion.div className="subject-breakdown" variants={itemVariants}>
            <h3>Due by Subject</h3>
            <div className="subject-list">
              {Object.entries(dueItems.by_subject).map(([subject, count]) => (
                <div key={subject} className="subject-item">
                  <span className="subject-name">{subject}</span>
                  <span className="subject-count">{count}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div className="quick-actions" variants={itemVariants}>
          <Link to="/add" className="action-card">
            <div className="action-icon">+</div>
            <div className="action-content">
              <h3>Add New Item</h3>
              <p>Create a new learning item to review</p>
            </div>
          </Link>

          <Link to="/items" className="action-card">
            <div className="action-icon">📖</div>
            <div className="action-content">
              <h3>Browse All Items</h3>
              <p>View and manage your learning library</p>
            </div>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
