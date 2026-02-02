"use client"

import * as React from "react"
import { BrowserMultiFormatReader } from "@zxing/browser"
import { Button } from "@/components/ui/button"

export function BarcodeScanner({
  onDetected,
}: {
  onDetected: (value: string) => void
}) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null)
  const readerRef = React.useRef<BrowserMultiFormatReader | null>(null)

  const [running, setRunning] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function start() {
    setError(null)
    try {
      if (!readerRef.current) readerRef.current = new BrowserMultiFormatReader()

      const video = videoRef.current
      if (!video) throw new Error("Video not ready")

      setRunning(true)

      await readerRef.current.decodeFromVideoDevice(
        undefined,
        video,
        (result, err) => {
          if (result) {
            const text = result.getText()
            onDetected(text)
            stop()
          }
          if (err) {
            // Ignore continuous scan errors
          }
        }
      )
    } catch {
      setError("Camera permission or device error")
      setRunning(false)
    }
  }

  function stop() {
    try {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
        videoRef.current.srcObject = null
      }
    } finally {
      setRunning(false)
    }
  }

  React.useEffect(() => {
    return () => stop()
  }, [])

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {!running ? (
          <Button type="button" variant="outline" onClick={start}>
            Start camera scan
          </Button>
        ) : (
          <Button type="button" variant="outline" onClick={stop}>
            Stop
          </Button>
        )}
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg border bg-black">
        <video ref={videoRef} className="h-60 w-full object-cover" muted playsInline />
      </div>
    </div>
  )
}
