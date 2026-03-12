'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import axios from 'axios'

export default function SettingsPanel() {
  const [settings, setSettings] = useState({
    fps_sampling: 10,
    similarity_threshold: 0.45,
    unknown_threshold: 0.35,
    tracker_distance_threshold: 120,
    exit_threshold_seconds: 5,
    stream_fps: 15.0,
  })

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await axios.get('http://localhost:8000/settings')
        setSettings(res.data)
      } catch (err) {
        console.error("Failed to load settings:", err)
      }
    }
    loadSettings()
  }, [])

  const [saved, setSaved] = useState(false)

  const handleSettingChange = (key: string, value: number) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
    setSaved(false)
  }

  const handleSaveSettings = async () => {
    try {
      await axios.post('http://localhost:8000/settings', settings)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error("Failed to save settings:", err)
    }
  }

  const settingsConfig = [
    {
      key: 'fps_sampling',
      label: 'Tracker FPS Sampling',
      description: 'How fast the system analyzes motion (frames per second)',
      min: 1,
      max: 30,
      step: 1,
      unit: 'FPS',
      category: 'Performance'
    },
    {
      key: 'similarity_threshold',
      label: 'Recognition Similarity Threshold',
      description: 'How strict the AI should be before matching a face to a known person',
      min: 0,
      max: 1,
      step: 0.01,
      unit: 'distance',
      category: 'AI Engine'
    },
    {
      key: 'unknown_threshold',
      label: 'Unknown Clustering Threshold',
      description: 'How distinct a stranger\'s face must be before they are logged as unique',
      min: 0,
      max: 1,
      step: 0.01,
      unit: 'distance',
      category: 'AI Engine'
    },
    {
      key: 'tracker_distance_threshold',
      label: 'Tracker Distance Threshold',
      description: 'Maximum pixel distance a face can move between frames before assuming a different person',
      min: 10,
      max: 500,
      step: 10,
      unit: 'pixels',
      category: 'Tracking'
    },
    {
      key: 'exit_threshold_seconds',
      label: 'Exit Expiry Duration',
      description: 'How many seconds a person can disappear from camera before logging as absent',
      min: 1,
      max: 60,
      step: 1,
      unit: 'seconds',
      category: 'Tracking'
    },
    {
      key: 'stream_fps',
      label: 'WebRTC Stream Limit',
      description: 'Maximum frame rate sent to frontend to prevent buffering',
      min: 5,
      max: 60,
      step: 1,
      unit: 'FPS',
      category: 'Performance'
    },
  ]

  const categories = ['Performance', 'AI Engine', 'Tracking']

  return (
    <div className="space-y-6">
      {/* Save Notification */}
      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
        >
          <p className="text-sm font-medium text-green-700">✓ Settings saved successfully</p>
        </motion.div>
      )}

      {/* Settings by Category */}
      {categories.map((category) => (
        <div key={category} className="space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              {category === 'Performance' && '⚡'}
              {category === 'AI Engine' && '🤖'}
              {category === 'Tracking' && '📍'}
              {category}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {category === 'Performance' && 'Control system resource usage and performance'}
              {category === 'AI Engine' && 'Configure AI recognition and clustering behavior'}
              {category === 'Tracking' && 'Fine-tune person tracking and detection'}
            </p>
          </div>

          <div className="space-y-4">
            {settingsConfig
              .filter(s => s.category === category)
              .map((setting, idx) => (
                <motion.div
                  key={setting.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{setting.label}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{setting.description}</p>
                        </div>
                        <Badge variant="secondary" className="ml-4">
                          {(settings as any)[setting.key].toFixed(setting.step < 1 ? 2 : 0)} {setting.unit}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <Slider
                          value={[(settings as any)[setting.key]]}
                          onValueChange={(value) => handleSettingChange(setting.key, value[0])}
                          min={setting.min}
                          max={setting.max}
                          step={setting.step}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Min: {setting.min}</span>
                          <span>Max: {setting.max}</span>
                        </div>
                      </div>

                      {/* Info Box */}
                      <div className="bg-background/50 p-3 rounded-lg border border-border text-xs text-muted-foreground">
                        <p>
                          {setting.key === 'fps_sampling' && 'Lower values save CPU but reduce detection accuracy. Recommended: 8-15 FPS'}
                          {setting.key === 'similarity_threshold' && 'Lower values = stricter matching. Too strict may miss people, too loose may cause false matches'}
                          {setting.key === 'unknown_threshold' && 'Controls how aggressively the system groups similar-looking strangers'}
                          {setting.key === 'tracker_distance_threshold' && 'Helps prevent ID switching when people move quickly or overlap'}
                          {setting.key === 'exit_threshold_seconds' && 'Longer duration means people staying out of frame longer before being marked absent'}
                          {setting.key === 'stream_fps' && 'Reduce if experiencing lag or buffer issues on the dashboard'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
          </div>
        </div>
      ))}

      {/* Save Button */}
      <div className="flex gap-3 pt-4">
        <Button
          onClick={handleSaveSettings}
          size="lg"
          className="flex-1 bg-primary hover:bg-primary/90"
        >
          Save All Settings
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="flex-1"
          onClick={() => {
            setSettings({
              fps_sampling: 10,
              similarity_threshold: 0.45,
              unknown_threshold: 0.35,
              tracker_distance_threshold: 120,
              exit_threshold_seconds: 5,
              stream_fps: 15.0,
            })
          }}
        >
          Reset to Defaults
        </Button>
      </div>

      {/* Warning Box */}
      <Card className="border-0 shadow-lg bg-amber-500/5 border-2 border-amber-500/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <span>⚠️</span> Important
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• Changes take effect immediately without server restart</p>
          <p>• Adjust thresholds carefully to maintain accuracy</p>
          <p>• Monitor performance metrics after making changes</p>
          <p>• Contact support if you experience issues</p>
        </CardContent>
      </Card>
    </div>
  )
}
