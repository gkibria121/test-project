import { useEffect, useState } from 'react'
import './App.css'

type Forecast = {
  date: string
  temperatureC: number
  summary?: string
  temperatureF?: number
}

function App() {
  const [forecasts, setForecasts] = useState<Forecast[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<number | null>(null)

  // Set this in your env: VITE_BACKEND_URL=http://localhost/api
  const backendUrl = import.meta.env.VITE_BACKEND_URL ?? ''
  // Fallback to /api so the app works when the env var isn't set (useful in dev)
  const apiBase = backendUrl || '/api'

  useEffect(() => {
    loadForecasts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadForecasts() {
    setLoading(true)
    setError(null)
    try {
      const url = `${apiBase.replace(/\/$/, '')}/weatherforecast`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} (${res.url})`)

      const ct = res.headers.get('content-type') || ''
      if (ct.includes('text/html')) {
        const text = await res.text()
        const snippet = text.replace(/\s+/g, ' ').slice(0, 200)
        throw new Error(`Expected JSON but got HTML from ${res.url}: ${snippet}...`)
      }

      const data = await res.json()
      const mapped: Forecast[] = data.map((d: any) => ({
        date: d.date ?? d.Date ?? d.DateOnly ?? '',
        temperatureC: d.temperatureC ?? d.TemperatureC ?? 0,
        summary: d.summary ?? d.Summary ?? '',
        temperatureF: d.temperatureF ?? d.TemperatureF ?? undefined
      }))
      setForecasts(mapped)
    } catch (err: any) {
      setError(err?.message ?? String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="App">
      <header>
        <h1>Weather Forecast</h1>
        <p className="muted">Backend URL: <code>{backendUrl || 'unset: set VITE_BACKEND_URL'}</code></p>
        <div className="controls">
          <button onClick={loadForecasts} disabled={loading}>Reload</button>
        </div>
      </header>

      {loading && <p>Loading forecasts…</p>}
      {error && <p className="error">Error: {error}</p>}

      <ul className="forecasts">
        {forecasts.map((f, i) => (
          <li key={i} onClick={() => setSelected(selected === i ? null : i)} className="forecast-item">
            <div className="summary">
              <strong>{new Date(f.date).toLocaleDateString()}</strong>
              <span>{f.summary}</span>
              <span>{f.temperatureC}°C</span>
            </div>
            {selected === i && (
              <div className="details">
                <div>Temperature F: {f.temperatureF ?? Math.round(32 + (f.temperatureC / 0.5556))}°F</div>
                <div>Raw date: {f.date}</div>
              </div>
            )}
          </li>
        ))}
      </ul>

      <footer className="muted">
        Click a forecast to view details.
      </footer>
    </div>
  )
}

export default App
