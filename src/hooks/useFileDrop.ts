import { getCurrentWebview } from "@tauri-apps/api/webview";
import { VIDEO_EXTENSIONS } from "@/utils/fileUtils";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export function useFileDrop(onVideosSelected: (filePaths: string[]) => void) {
    const [isDragging, setIsDragging] = useState(false);

    const onVideosSelectedRef = useRef(onVideosSelected);
    useEffect(() => {
        onVideosSelectedRef.current = onVideosSelected;
    }, [onVideosSelected]);

    useEffect(() => {
        const unlistenPromise = getCurrentWebview().onDragDropEvent((event) => {
            const type = event.payload.type;

            if (type === "enter" || type === "over") {
                setIsDragging(true);
                return;
            }

            if (type === "drop") {
                setIsDragging(false);

                const paths = event.payload.paths ?? [];
                const videoFiles = paths.filter((path) => {
                    const ext = path.split(".").pop()?.toLowerCase();
                    return ext ? VIDEO_EXTENSIONS.includes(ext) : false;
                });

                if (videoFiles.length > 0) {
                    onVideosSelectedRef.current(videoFiles);
                } else {
                    toast.error("El archivo no es un vídeo compatible.");
                }

                return;
            }

            setIsDragging(false);
        });

        return () => {
            unlistenPromise.then((unlisten) => unlisten());
        };
    }, []);

    return { isDragging };
}