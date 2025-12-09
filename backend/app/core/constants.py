"""
Core constants for the spaced repetition system.
"""

# Spaced Repetition Intervals (in days)
REVIEW_INTERVALS = [0, 1, 3, 7, 30]

# After reaching the last interval (30 days), cycle back to this level
CYCLE_BACK_TO_LEVEL = 3  # 7 days
