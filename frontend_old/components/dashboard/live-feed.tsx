"use client"

import { useEffect, useState, useRef } from "react"
import { Circle, Video, ScanFace } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

export function LiveFeed() {
  const [attendance, setAttendance] = useState([])
  const [cameras, setCameras] = useState([
    { id: "01", status: "online" },
    { id: "02", status: "online" },
    { id: "03", status: "offline" },
    { id: "04", status: "online" },
  ])

  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // ---------------------------------------------------------
    // Set up WebRTC Connection
    // ---------------------------------------------------------
    let pc: RTCPeerConnection;

    const negotiate = async () => {
      pc = new RTCPeerConnection()

      pc.addTransceiver('video', { direction: 'recvonly' })

      pc.addEventListener('track', (evt) => {
        if (evt.track.kind === 'video' && videoRef.current) {
          videoRef.current.srcObject = evt.streams[0]
        }
      })

      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      try {
        const response = await fetch("http://localhost:8000/offer", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sdp: pc.localDescription?.sdp,
            type: pc.localDescription?.type,
            camera_id: "01" // Default stream 01
          })
        })
        const answer = await response.json()
        await pc.setRemoteDescription(answer)
      } catch (err) {
        console.error("WebRTC negotiation failed:", err)
      }
    }

    // Call negotiate, retry slightly if backend isn't awake
    setTimeout(negotiate, 500)

    // ---------------------------------------------------------
    // Fetch Metrics
    // ---------------------------------------------------------
    const fetchAttendance = async () => {
      try {
        const res = await fetch("http://localhost:8000/today-attendance")
        if (res.ok) {
          const data = await res.json()
          const formatted = data.map((record: any) => ({
            name: record.person_name,
            time: new Date(record.entry_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            confidence: record.avg_confidence > 1 ? record.avg_confidence : record.avg_confidence * 100,
            status: record.is_unknown ? "unknown" : "recognized",
          }))
          setAttendance(formatted.slice(0, 50))
        }
      } catch (e) {
        console.error("Failed to fetch attendance:", e)
      }
    }

    const fetchCameras = async () => {
      try {
        const res = await fetch("http://localhost:8000/camera-status")
        if (res.ok) {
          const data = await res.json()
          const mappedCameras = data.map((c: any) => ({
            id: c.camera_id,
            status: c.status === "active" ? "online" : "offline",
          }))
          if (mappedCameras.length > 0) {
            setCameras(mappedCameras)
          }
        }
      } catch (e) {
        console.error("Failed to fetch camera status:", e)
      }
    }

    fetchAttendance()
    fetchCameras()
    const interval = setInterval(() => {
      fetchAttendance()
      fetchCameras()
    }, 2000)

    return () => {
      clearInterval(interval)
      if (pc) pc.close()
    }
  }, [])
  return (
    <div className="grid gap-4 lg:grid-cols-5">
      {/* Camera Stream Placeholder */}
      <Card className="border-border/60 lg:col-span-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              Live Camera Feed
            </CardTitle>
            <Badge
              variant="outline"
              className="gap-1 border-success/30 bg-success/10 text-success"
            >
              <Circle className="size-1.5 fill-current" />
              Live
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative aspect-video overflow-hidden rounded-lg bg-muted/50 border border-border/40">
            {/* Live Video Stream via WebRTC */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5 rounded-md bg-background/80 px-2 py-1 text-xs backdrop-blur-sm">
                <Circle className="size-1.5 fill-success text-success animate-pulse" />
                Recording
              </div>
              <div className="rounded-md bg-background/80 px-2 py-1 text-xs backdrop-blur-sm">
                08:52:34 AM
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-4 gap-2">

            {cameras.map((cam, i) => (
              <div
                key={cam.id || i.toString()}
                className="relative aspect-video overflow-hidden rounded-md border border-border/40 bg-muted/30"
              >
                <div className="flex h-full items-center justify-center">
                  <Video className="size-3 text-muted-foreground" />
                </div>
                <div className="absolute bottom-1 left-1">
                  <Circle
                    className={`size-1.5 ${cam.status === "online"
                      ? "fill-success text-success"
                      : "fill-destructive text-destructive"
                      }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Attendance Feed */}
      <Card className="border-border/60 lg:col-span-3">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              Real-Time Attendance Feed
            </CardTitle>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ScanFace className="size-3.5" />
              <span>{attendance.length} recognitions</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[360px] pr-4">
            <div className="flex flex-col gap-2">
              {attendance.map((record: any, i: number) => {
                const initials = record.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg border border-border/40 p-3 transition-colors hover:bg-muted/50"
                  >
                    <Avatar className="size-9">
                      <AvatarFallback
                        className={
                          record.status === "recognized"
                            ? "bg-primary/10 text-primary text-xs"
                            : "bg-destructive/10 text-destructive text-xs"
                        }
                      >
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate text-foreground">
                          {record.name}
                        </span>
                        <Badge
                          variant={
                            record.status === "recognized"
                              ? "secondary"
                              : "destructive"
                          }
                          className="shrink-0 text-[10px]"
                        >
                          {record.status === "recognized"
                            ? "Recognized"
                            : "Unknown"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {record.time}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p
                        className={`text-sm font-mono font-medium ${(record.confidence || 0) > 90
                          ? "text-success"
                          : (record.confidence || 0) > 70
                            ? "text-warning"
                            : "text-destructive"
                          }`}
                      >
                        {(record.confidence || 0).toFixed(1)}%
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        confidence
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
