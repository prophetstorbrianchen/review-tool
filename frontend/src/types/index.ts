export interface LearningItem {
  id: string;
  subject: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  review_count: number;
  next_review_date: string;
  current_interval_days: number;
  manual_review_count: number;
  is_deleted: boolean;
}

export interface ReviewHistory {
  id: string;
  learning_item_id: string;
  reviewed_at: string;
  interval_days: number;
  next_review_date: string;
  review_number: number;
  is_manual: boolean;
}

export interface DueItemsResponse {
  items: LearningItem[];
  total_due: number;
  by_subject: Record<string, number>;
}

export interface ReviewStats {
  total_items: number;
  total_reviews: number;
  items_due_today: number;
  items_due_this_week: number;
  reviews_by_interval: Record<number, number>;
}

export interface CreateLearningItemData {
  subject: string;
  title: string;
  content: string;
}
