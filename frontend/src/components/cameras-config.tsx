'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import axios from 'axios'

export default function CamerasConfig() {
  const [cameras, setCameras] = useState<{camera_id: string, camera_name: string}[]>([])
  const [newSource, setNewSource] = useState('')

  const fetchCameras = async () => {
    try {
      const res = await axios.get('http://localhost:8000/cameras')
      setCameras(res.data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchCameras()
  }, [])

  const handleAddCamera = async () => {
    if (newSource.trim()) {
      const isWebcam = /^\d+$/.test(newSource)
      const name = isWebcam ? `Webcam ${newSource}` : 'IP Camera'
      try {
        await axios.post('http://localhost:8000/cameras', {
          camera_id: newSource,
          camera_name: name
        })
        setNewSource('')
        fetchCameras()
      } catch (e) {
        console.error(e)
      }
    }
  }

  const handleDeleteCamera = async (id: string) => {
    try {
      await axios.delete(`http://localhost:8000/cameras/${encodeURIComponent(id)}`)
      fetchCameras()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="space-y-6">
      {/* Add New Camera Section */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-card via-card to-card/80">
        <CardHeader>
          <CardTitle className="text-lg">Add New Camera Source</CardTitle>
          <CardDescription>Connect a local webcam or IP camera</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Camera Source</label>
              <Input
                placeholder="0 for webcam or rtsp://192.168.1.100:554/stream"
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCamera()}
                className="mt-2 border-border/50"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddCamera} className="w-full bg-primary hover:bg-primary/90">
                <span className="mr-2">+</span> Add Camera
              </Button>
            </div>
            <div className="bg-background/50 p-3 rounded-lg border border-border/50">
              <p className="text-xs text-muted-foreground font-medium">HELP</p>
              <p className="text-xs text-muted-foreground mt-1">
                Use 0, 1, 2 for webcams or full RTSP URLs for IP cameras
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Camera List */}
      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Connected Cameras</h3>
          <p className="text-sm text-muted-foreground">{cameras.length} camera{cameras.length !== 1 ? 's' : ''} active</p>
        </div>

        <div className="space-y-3">
          {cameras.map((camera, idx) => (
            <motion.div
              key={camera.camera_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between p-4 bg-background/50 border-b border-border">
                    <div className="flex items-center gap-4 flex-1 overflow-hidden">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 flex items-center justify-center shrink-0">
                        <span className="text-lg">📹</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground truncate">{camera.camera_name}</h4>
                        <p className="text-xs text-muted-foreground font-mono mt-1 truncate">{camera.camera_id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 ml-4 shrink-0">
                      <div className="text-right">
                        <Badge className="bg-green-500 hover:bg-green-600">
                          active
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-2">WebRTC</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCamera(camera.camera_id)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Deployment Guide */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-accent/5 via-accent/2 to-accent/5 border-2 border-accent/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <span>📚</span> Deployment Guide
          </CardTitle>
          <CardDescription>Best practices for camera deployment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><strong className="text-foreground">📍 Placement:</strong> Position cameras to capture maximum traffic areas with good lighting</p>
            <p><strong className="text-foreground">🔗 Connection:</strong> Ensure stable network connection for IP cameras (min 5 Mbps recommended)</p>
            <p><strong className="text-foreground">⚡ Power:</strong> Use UPS or backup power for critical camera locations</p>
            <p><strong className="text-foreground">🔒 Security:</strong> Change default credentials and use strong passwords for IP cameras</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
