import { LazyStore } from "@tauri-apps/plugin-store"

export interface Settings {
  outputSuffix: string
}

export const DEFAULT_SETTINGS: Settings = {
  outputSuffix: "_recortado",
}

const INVALID_SUFFIX_CHARS = /[\\/:*?"<>|]/

const store = new LazyStore("settings.json", { autoSave: false })

export function validateOutputSuffix(value: string): string | null {
  if (value.length === 0) return "El sufijo no puede estar vacío."
  if (INVALID_SUFFIX_CHARS.test(value)) return 'No puede contener \\ / : * ? " < > |.'
  return null
}

export async function loadSettings(): Promise<Settings> {
  const storedSuffix = await store.get<unknown>("outputSuffix")
  const outputSuffix =
    typeof storedSuffix === "string" && validateOutputSuffix(storedSuffix) === null
      ? storedSuffix
      : DEFAULT_SETTINGS.outputSuffix

  return { outputSuffix }
}

export async function saveSetting<K extends keyof Settings>(
  key: K,
  value: Settings[K]
): Promise<void> {
  await store.set(key, value)
  await store.save()
}
