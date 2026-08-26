import { VideoDetails } from "./video-info";

export type QueueItemStatus = 'pending' | 'processing' | 'completed' | 'error';

export interface QueueItem {
    id: string;
    inputPath: string;
    outputPath: string;
    fileName: string;
    durationSec: number | null;
    startTime: number | null;
    endTime: number | null;
    thumbnailUrl: string | null;
    status: QueueItemStatus;
    errorMessage?: string;
    details: VideoDetails | null;
}