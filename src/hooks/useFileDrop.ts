import { getCurrentWebview } from "@tauri-apps/api/webview";
import { VIDEO_EXTENSIONS } from "@/utils/fileUtils";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export function useFileDrop(onVideoSelected:(filePath: string) => void) {
    const [isDragging, setIsDragging] = useState(false);
    
    const onVideoSelectedRef = useRef(onVideoSelected);
    useEffect(() => {
        onVideoSelectedRef.current = onVideoSelected;
    }, [onVideoSelected]);

    useEffect(() => {
        const unlistenPromise = getCurrentWebview().onDragDropEvent((event) => {
        const type = event.payload.type;

        if (type === "enter" || type === "over") {
            setIsDragging(true);
        } 
        else if (type === "drop") {
            setIsDragging(false);
            const paths = event.payload.paths;

            if (paths && paths.length > 0) {
                const videoFile = paths.find((p) => {
                    const ext = p.split(".").pop()?.toLowerCase();
                    return ext && VIDEO_EXTENSIONS.includes(ext);
                });

                if (videoFile) {
                    onVideoSelectedRef.current(videoFile);
                } else {
                    toast.error("El archivo no es un vídeo compatible.");
                }
            }
        } 
        else {
            setIsDragging(false);
        }
        });

        return () => {
            unlistenPromise.then((unlisten) => unlisten());
        };
    }, []);

    return { isDragging };
}