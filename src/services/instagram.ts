import { api } from "../lib/apiClient";
import type {
  InstagramMediaResponseDto,
  Media,
  Page,
} from "../types/instagram";

// Adapter: DTO -> Page<Media>
function adaptMediaPage(dto: InstagramMediaResponseDto): Page<Media> {
  const items: Media[] = (dto.data ?? []).map((m) => ({
    id: m.id,
    caption: m.caption ?? null,
  }));
  const next =
    dto.paging?.cursors?.after ??
    dto.paging?.next ??
    null;

  return { items, next };
}

// NOTE: Your controller doesn't accept ?after right now,
// so we call it without a query param.
export async function fetchMedia(instagramId: string) {
  const { data } = await api.get<InstagramMediaResponseDto>(
    `/auto/instagram-media/${instagramId}`
  );
  return adaptMediaPage(data);
}
