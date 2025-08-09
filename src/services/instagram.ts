import { api } from "../lib/apiClient";
import type {
  InstagramMediaResponseDto,
  Media,
  Page,
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
