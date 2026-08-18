import { getCurrentWindow } from "@tauri-apps/api/window";
import { Copy, Minus, Square, X } from "lucide-react";
import { useEffect, useState } from "react";

const appWindow = getCurrentWindow();

export function Header(){
    const [isMaximized, setIsMaximized] = useState(false);

    useEffect(() => {
        appWindow.isMaximized().then(setIsMaximized);
        const unlisten = appWindow.onResized(() => {
            appWindow.isMaximized().then(setIsMaximized);
        });

        return () => {
            unlisten.then((fn) => fn());
        };
    }, []);
    
    return (
        <header 
        data-tauri-drag-region
        className="h-10 flex-shrink-0 flex items-center justify-start border-b border-border"
        >
            <div data-tauri-drag-region className="flex items-center gap-2 pl-4 flex-1">
                <span className="text-sm font-medium text-foreground">TAJO</span>
                {/* aquí irá el menú de opciones */}
            </div>

            <div className="flex h-full items-stretch">
                <button
                onClick={() => appWindow.minimize()}
                className="w-11 flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-default"
                >
                <Minus size={16} />
                </button>
                
                <button
                onClick={() => appWindow.toggleMaximize()}
                className="w-11 flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-default"
                >
                {isMaximized ? <Copy size={14} /> : <Square size={14} />}
                </button>

                <button
                onClick={() => appWindow.close()}
                className="w-11 flex items-center justify-center text-muted-foreground hover:bg-red-600 hover:text-white transition-colors cursor-default"
                >
                <X size={16} />
                </button>
            </div>
        </header>
    );
}