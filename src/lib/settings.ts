import { LazyStore } from "@tauri-apps/plugin-store"

export type OutputDirMode = "same" | "fixed"

export interface Settings {
  outputSuffix: string
  outputDirMode: OutputDirMode
  outputDir: string | null
}

export const DEFAULT_SETTINGS: Settings = {
  outputSuffix: "_recortado",
  outputDirMode: "same",
  outputDir: null,
}

const INVALID_SUFFIX_CHARS = /[\\/:*?"<>|]/

const store = new LazyStore("settings.json", { autoSave: false })

export function validateOutputSuffix(value: string): string | null {
  if (value.length === 0) return "El sufijo no puede estar vacío."
  if (INVALID_SUFFIX_CHARS.test(value)) return 'No puede contener \\ / : * ? " < > |.'
  return null
}

export async function loadSettings(): Promise<Settings> {
  const [storedSuffix, storedMode, storedDir] = await Promise.all([
    store.get<unknown>("outputSuffix"),
    store.get<unknown>("outputDirMode"),
    store.get<unknown>("outputDir"),
  ])

  const outputSuffix =
    typeof storedSuffix === "string" && validateOutputSuffix(storedSuffix) === null
      ? storedSuffix
      : DEFAULT_SETTINGS.outputSuffix

  const outputDir =
    typeof storedDir === "string" && storedDir.trim().length > 0 ? storedDir : null

  const outputDirMode: OutputDirMode =
    storedMode === "fixed" && outputDir !== null ? "fixed" : "same"

  return { outputSuffix, outputDirMode, outputDir }
}

export async function saveSetting<K extends keyof Settings>(
  key: K,
  value: Settings[K]
): Promise<void> {
  await store.set(key, value)
  await store.save()
}
