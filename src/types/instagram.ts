// === Backend DTOs (mirror your Java classes) ===
export interface InstagramMedia {
  id: string;
  caption: string | null;
}

export interface InstagramMediaResponseDto {
  data: InstagramMedia[];
  paging?: {
    cursors?: {
      before?: string | null;
      after?: string | null;
    };
    next?: string | null;
  };
}

// === UI-friendly shape ===
export type Media = {
  id: string;
  caption?: string | null;
};

export type Page<T> = {
  items: T[];
  next?: string | null;
};

export interface CommentReplyRecord {
  id: string;
  mediaId: string;
  commentId: string;
  username: string;
  text: string;
  replyMessage?: string | null;
  replied: boolean;
  commentedAt?: string | null;
  repliedAt?: string | null;
  replies?: ReplyDto[];
}

export interface ReplyDto {
  id: string;
  text: string;
  timestamp: string;
}

export interface CommentReplyPage {
  content: CommentReplyRecord[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ReplyRequestDto {
  message: string;
}
