import { useEffect, useState, type ReactNode } from "react"
import { Dialog } from "radix-ui"
import { Settings, X } from "lucide-react"
import { getVersion } from "@tauri-apps/api/app"
import { open as openDialog } from "@tauri-apps/plugin-dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { Switch } from "./ui/switch"
import { useSettings } from "@/hooks/useSettings"
import { validateOutputSuffix, type OutputDirMode } from "@/lib/settings"
import { cn } from "@/lib/utils"

const SECTIONS = [
  { id: "general", label: "General" },
  { id: "export", label: "Exportación" },
  { id: "shortcuts", label: "Atajos" },
  { id: "about", label: "Acerca de" },
] as const

type SectionId = (typeof SECTIONS)[number]["id"]

const SELECT_CLASS =
  "h-8 border border-input bg-transparent px-2 text-xs text-foreground outline-none [color-scheme:light] disabled:cursor-not-allowed disabled:opacity-50 dark:[color-scheme:dark]"

// TODO: sustituir por el registro central de atajos cuando exista.
const SHORTCUTS = [
  { action: "Ver información del vídeo", keys: "Ctrl + I" },
  { action: "Vídeo anterior", keys: "Alt + ↑" },
  { action: "Vídeo siguiente", keys: "Alt + ↓" },
  { action: "Confirmar tiempo de inicio/fin", keys: "Enter" },
]

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function SettingsRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-6 py-2.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex shrink-0 items-center gap-2">{children}</div>
    </div>
  )
}

function GeneralSection() {
  return (
    <div className="divide-y divide-border">
      <SettingsRow label="Idioma">
        <select disabled defaultValue="es" className={SELECT_CLASS}>
          <option value="es">Español</option>
          <option value="en">English</option>
        </select>
      </SettingsRow>
      <SettingsRow label="Tema">
        <select disabled defaultValue="system" className={SELECT_CLASS}>
          <option value="light">Claro</option>
          <option value="dark">Oscuro</option>
          <option value="system">Sistema</option>
        </select>
      </SettingsRow>
    </div>
  )
}

interface ExportSectionProps {
  suffix: string
  suffixError: string | null
  isLoaded: boolean
  outputDirMode: OutputDirMode
  outputDir: string | null
  onSuffixChange: (value: string) => void
  onOutputDirModeChange: (mode: OutputDirMode) => void
  onPickOutputDir: () => void
}

function ExportSection({
  suffix,
  suffixError,
  isLoaded,
  outputDirMode,
  outputDir,
  onSuffixChange,
  onOutputDirModeChange,
  onPickOutputDir,
}: ExportSectionProps) {
  return (
    <div className="divide-y divide-border">
      <SettingsRow label="Carpeta de salida">
        <Select
          value={outputDirMode}
          onValueChange={(value) => onOutputDirModeChange(value as OutputDirMode)}
          disabled={!isLoaded}
        >
          <SelectTrigger aria-label="Carpeta de salida" className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="same">Misma carpeta que el original</SelectItem>
            <SelectItem value="fixed">Carpeta fija</SelectItem>
          </SelectContent>
        </Select>
      </SettingsRow>
      {outputDirMode === "fixed" && (
        <div className="px-6 py-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Carpeta elegida</span>
            <Button
              variant="outline"
              size="sm"
              disabled={!isLoaded}
              className="disabled:cursor-not-allowed"
              onClick={onPickOutputDir}
            >
              Elegir carpeta…
            </Button>
          </div>
          <p className="mt-2 break-all text-xs" title={outputDir ?? undefined}>
            {outputDir ?? "Ninguna carpeta elegida"}
          </p>
        </div>
      )}
      <SettingsRow label="Sufijo del nombre de salida">
        <div className="flex flex-col items-end gap-1">
          <Input
            value={suffix}
            onChange={(event) => onSuffixChange(event.target.value)}
            disabled={!isLoaded}
            placeholder={isLoaded ? undefined : "Cargando…"}
            aria-invalid={suffixError ? true : undefined}
            aria-describedby={suffixError ? "output-suffix-error" : undefined}
            className="h-8 w-40 text-xs"
          />
          {suffixError && (
            <p id="output-suffix-error" className="max-w-56 text-right text-xs text-destructive">
              {suffixError}
            </p>
          )}
        </div>
      </SettingsRow>
      <SettingsRow label="Pasar al siguiente vídeo tras exportar">
        <Switch disabled aria-label="Pasar al siguiente vídeo tras exportar" />
      </SettingsRow>
    </div>
  )
}

function ShortcutsSection() {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border text-left text-xs text-muted-foreground">
          <th className="px-6 py-2 font-normal">Acción</th>
          <th className="px-6 py-2 text-right font-normal">Tecla</th>
        </tr>
      </thead>
      <tbody>
        {SHORTCUTS.map((shortcut) => (
          <tr key={shortcut.action} className="border-b border-border last:border-b-0">
            <td className="px-6 py-2.5 text-muted-foreground">{shortcut.action}</td>
            <td className="px-6 py-2.5 text-right font-mono text-xs">{shortcut.keys}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function AboutSection({ version }: { version: string }) {
  return (
    <div className="divide-y divide-border">
      <SettingsRow label="Aplicación">
        <span>Tajo</span>
      </SettingsRow>
      <SettingsRow label="Versión">
        <span className="font-mono text-xs">{version}</span>
      </SettingsRow>
      <SettingsRow label="Motor">
        <span className="text-muted-foreground">Usa ffmpeg (versión pendiente)</span>
      </SettingsRow>
    </div>
  )
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { settings, isLoaded, updateSetting } = useSettings()
  const [activeSection, setActiveSection] = useState<SectionId>("general")
  const [version, setVersion] = useState("—")
  const [suffixDraft, setSuffixDraft] = useState("")
  const [suffixError, setSuffixError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return

    let cancelled = false
    getVersion()
      .then((value) => {
        if (!cancelled) setVersion(value)
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [open])

  useEffect(() => {
    if (!open || !isLoaded) return

    setSuffixDraft(settings.outputSuffix)
    setSuffixError(null)
  }, [open, isLoaded, settings.outputSuffix])

  const handleSuffixChange = (value: string) => {
    setSuffixDraft(value)

    const error = validateOutputSuffix(value)
    setSuffixError(error)

    if (!error) updateSetting("outputSuffix", value)
  }

  const handleOutputDirModeChange = async (mode: OutputDirMode) => {
    if (mode === "same") {
      updateSetting("outputDirMode", "same")
      return
    }

    updateSetting("outputDirMode", "fixed")

    if (settings.outputDir) return

    try {
      const selected = await openDialog({
        directory: true,
        defaultPath: settings.outputDir ?? undefined,
      })

      if (selected) {
        updateSetting("outputDir", selected)
      } else {
        updateSetting("outputDirMode", "same")
      }
    } catch (error) {
      console.error("No se pudo elegir la carpeta de salida:", error)
      updateSetting("outputDirMode", "same")
    }
  }

  const handlePickOutputDir = async () => {
    try {
      const selected = await openDialog({
        directory: true,
        defaultPath: settings.outputDir ?? undefined,
      })

      if (selected) updateSetting("outputDir", selected)
    } catch (error) {
      console.error("No se pudo elegir la carpeta de salida:", error)
    }
  }

  const content: Record<SectionId, ReactNode> = {
    general: <GeneralSection />,
    export: (
      <ExportSection
        suffix={suffixDraft}
        suffixError={suffixError}
        isLoaded={isLoaded}
        outputDirMode={settings.outputDirMode}
        outputDir={settings.outputDir}
        onSuffixChange={handleSuffixChange}
        onOutputDirModeChange={handleOutputDirModeChange}
        onPickOutputDir={handlePickOutputDir}
      />
    ),
    shortcuts: <ShortcutsSection />,
    about: <AboutSection version={version} />,
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label="Ajustes"
          title="Ajustes"
          className="mr-3 flex w-11 cursor-default items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Settings size={16} />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-background/90" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex h-[min(30rem,85vh)] w-[min(44rem,90vw)] -translate-x-1/2 -translate-y-1/2 flex-col border border-border bg-popover text-popover-foreground">
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-6 py-4">
            <Dialog.Title className="text-base font-medium">Ajustes</Dialog.Title>
            <Dialog.Close
              aria-label="Cerrar"
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">
            Preferencias de la aplicación
          </Dialog.Description>

          <div className="flex min-h-0 flex-1">
            <nav
              aria-label="Secciones de ajustes"
              className="w-44 shrink-0 overflow-y-auto border-r border-border py-2"
            >
              {SECTIONS.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  aria-current={activeSection === section.id ? "page" : undefined}
                  className={cn(
                    "w-full px-4 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                    activeSection === section.id && "bg-accent text-foreground"
                  )}
                >
                  {section.label}
                </button>
              ))}
            </nav>

            <div className="min-w-0 flex-1 overflow-y-auto">{content[activeSection]}</div>
          </div>

          <p className="shrink-0 border-t border-border px-6 py-2 text-xs text-muted-foreground">
            Algunos ajustes aún no están disponibles
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
