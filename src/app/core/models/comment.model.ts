export interface Comment {
  _id: string;
  article: string;
  author: {
    _id: string;
    username: string;
    email: string;
  };
  authorName?: string; // Nom d'utilisateur stocké directement
  content: string;
  parentComment?: string;
  replies?: Comment[];
  likes?: string[];
  isEdited?: boolean;
  editedAt?: Date;
  isDeleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
  replyCount?: number;
  likeCount?: number;
}

export interface CommentResponse {
  comments: Comment[];
  currentPage: number;
  totalPages: number;
  totalComments: number;
}

export interface CreateCommentRequest {
  articleId: string;
  content: string;
  parentCommentId?: string;
}

export interface CommentLikeResponse {
  message: string;
  comment: Comment;
  userLiked: boolean;
}

export interface CommentEvent {
  comment: Comment;
  type: 'comment' | 'reply';
} 