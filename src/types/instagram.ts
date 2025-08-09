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
