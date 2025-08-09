import { api } from "../lib/apiClient";
import type {
  InstagramMediaResponseDto,Media,Page,CommentReplyPage,ReplyRequestDto
} from "../types/instagram";

// Adapt backend DTO -> UI Page<Media>
function adaptMediaPage(dto: InstagramMediaResponseDto): Page<Media> {
  return {
    items: (dto.data ?? []).map(m => ({ id: m.id, caption: m.caption ?? null })),
    next: dto.paging?.cursors?.after ?? dto.paging?.next ?? null,
  };
}

/** GET /auto/instagram-media/{instagramId} */
export async function fetchMedia(instagramId: string): Promise<Page<Media>> {
  const { data } = await api.get<InstagramMediaResponseDto>(
    `/auto/instagram-media/${instagramId}`
  );
  return adaptMediaPage(data);
}

// Get unreplied comments for a media
export async function fetchUnrepliedComments(mediaId: string, page = 0, size = 25) {
  const { data } = await api.get<CommentReplyPage>(
    `/auto/comments/unreplied`,
    { params: { mediaId, page, size } }
  );
  return data;
}

// Post reply to a comment
export async function postCommentReply(commentId: string, message: string) {
  const body: ReplyRequestDto = { message };
  const { data } = await api.post(`/auto/comments/${commentId}/reply`, body);
  return data;
}
