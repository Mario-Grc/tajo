import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";

export function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function greet() {
    setLoading(true);
    try {
      const response = await invoke<string>("greet", { name });
      setGreetMsg(response);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex h-screen flex-col items-center justify-center bg-background text-foreground p-8 select-none">
      <div className="max-w-md w-full space-y-6 text-center border border-border bg-card p-6 rounded-none">
        
        {/* Cabecera */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            TAJO Editor
          </h1>
          <p className="text-sm text-muted-foreground">
            Verificación de interfaz Tailwind v4 + shadcn (Lyra)
          </p>
        </div>

        {/* Input y Botón de prueba */}
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            greet();
          }}
        >
          <input
            className="w-full bg-background border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring transition-colors"
            placeholder="Escribe algo para Rust..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="flex gap-2 justify-center">
            <Button type="submit" disabled={loading}>
              {loading ? "Procesando..." : "Enviar a Rust"}
            </Button>
            
            <Button variant="secondary" type="button">
              Secundario
            </Button>
            
            <Button variant="destructive" type="button">
              Borrar
            </Button>
          </div>
        </form>

        {/* Mensaje de respuesta de Rust */}
        {greetMsg && (
          <div className="p-3 bg-background border border-border text-sm font-mono text-emerald-400">
            {greetMsg}
          </div>
        )}

      </div>
    </main>
  );
}

export default App;