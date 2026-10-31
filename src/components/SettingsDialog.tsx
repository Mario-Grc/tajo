import { useEffect, useState, type ReactNode } from "react"
import { Dialog } from "radix-ui"
import { Settings, X } from "lucide-react"
import { getVersion } from "@tauri-apps/api/app"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Switch } from "./ui/switch"
import { cn } from "@/lib/utils"

const SECTIONS = [
  { id: "general", label: "General" },
  { id: "export", label: "Exportación" },
  { id: "shortcuts", label: "Atajos" },
  { id: "about", label: "Acerca de" },
] as const

type SectionId = (typeof SECTIONS)[number]["id"]

const SELECT_CLASS =
  "h-8 border border-input bg-transparent px-2 text-xs text-foreground outline-none disabled:cursor-not-allowed disabled:opacity-50"

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

function ExportSection() {
  return (
    <div className="divide-y divide-border">
      <SettingsRow label="Carpeta de salida">
        <select disabled defaultValue="original" className={SELECT_CLASS}>
          <option value="original">Misma carpeta que el original</option>
        </select>
        <Button variant="outline" size="sm" disabled className="disabled:cursor-not-allowed">
          Elegir carpeta…
        </Button>
      </SettingsRow>
      <SettingsRow label="Sufijo del nombre">
        <Input
          defaultValue="_recortado"
          disabled
          className="h-8 w-40 text-xs disabled:cursor-not-allowed"
        />
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
  const [activeSection, setActiveSection] = useState<SectionId>("general")
  const [version, setVersion] = useState("—")

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

  const content: Record<SectionId, ReactNode> = {
    general: <GeneralSection />,
    export: <ExportSection />,
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
            Ajustes aún no disponibles
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
