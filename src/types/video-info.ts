export interface FfprobeStream {
  codec_type: string;
  codec_name: string;
  width?: number;
  height?: number;
  r_frame_rate?: string;
  channels?: number;
  sample_rate?: string;
}
export interface FfprobeMetadata {
  format: { size?: string; bit_rate?: string; [key: string]: unknown };
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
  bitRate: number | null;
  audioCodec: string | null;
  audioChannels: number | null;
  audioSampleRate: number | null;
}