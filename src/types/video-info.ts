export interface FfprobeStream {
  codec_type: string;
  codec_name: string;
  width?: number;
  height?: number;
  r_frame_rate?: string;
}
export interface FfprobeMetadata {
  format: { size?: string; [key: string]: unknown };
  streams: FfprobeStream[];
}
export interface VideoInfo {
  durationSec: number;
  thumbnailBase64: string;
  metadata: FfprobeMetadata;
}
export interface VideoDetails {
  width: number | null;
  height: number | null;
  fps: number | null;
  codec: string | null;
  sizeBytes: number | null;
}