import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import {
  DEFAULT_SETTINGS,
  loadSettings,
  saveSetting,
  type Settings,
} from "@/lib/settings"

interface SettingsContextValue {
  settings: Settings
  isLoaded: boolean
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false

    loadSettings()
      .then((loaded) => {
        if (cancelled) return
        setSettings(loaded)
        setIsLoaded(true)
      })
      .catch((error) => {
        console.error("No se pudieron cargar los ajustes:", error)
        if (!cancelled) setIsLoaded(true)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const updateSetting = useCallback(
    <K extends keyof Settings,>(key: K, value: Settings[K]) => {
      setSettings((current) => ({ ...current, [key]: value }))

      saveSetting(key, value).catch((error) => {
        console.error("No se pudo guardar el ajuste:", error)
      })
    },
    []
  )

  const value = useMemo(
    () => ({ settings, isLoaded, updateSetting }),
    [settings, isLoaded, updateSetting]
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const context = useContext(SettingsContext)

  if (!context) {
    throw new Error("useSettings debe usarse dentro de SettingsProvider")
  }

  return context
}
