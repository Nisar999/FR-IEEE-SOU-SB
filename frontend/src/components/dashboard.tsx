'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'

import { fetchLiveHeadcount } from '@/services/api'
import axios from 'axios'
import VideoStream from '@/components/VideoStream'

export default function Dashboard() {
  const [headcount, setHeadcount] = useState({ known_persons: 0, unknown_persons: 0, total_persons: 0 });
  const [trackedToday, setTrackedToday] = useState(0);
  const [cameras, setCameras] = useState<{camera_id: string, camera_name: string}[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    const loadHeadcount = async () => {
      try {
        const res = await fetchLiveHeadcount();
        setHeadcount(res.data);
      } catch (err) {
        console.error("Failed to load headcount", err);
      }
    };
    
    const loadCameras = async () => {
      try {
        const res = await axios.get('http://localhost:8000/cameras');
        setCameras(res.data);
      } catch (err) {
        console.error("Failed to load cameras", err);
      }
    };

    const loadAttendance = async () => {
      try {
        const res = await axios.get('http://localhost:8000/today-attendance');
        setTrackedToday(res.data.length);
      } catch (err) {
        console.error("Failed to load attendance", err);
      }
    };

    const loadRecentActivity = async () => {
      try {
        const [unknownRes, knownRes] = await Promise.all([
          axios.get('http://localhost:8000/unknown-persons'),
          axios.get('http://localhost:8000/today-attendance')
        ]);
        
        const timestamp = (dateStr: string) => dateStr ? new Date(dateStr + 'Z').getTime() : 0;
        
        const unknowns = unknownRes.data.map((p: any) => ({
          name: `Unknown Person #${p.track_id}`,
          timeRaw: timestamp(p.last_seen),
          time: p.last_seen ? formatDistanceToNow(new Date(p.last_seen + 'Z'), { addSuffix: true }) : 'Unknown',
          location: 'Live Feed',
          type: 'unknown'
        }));

        const knowns = knownRes.data.map((p: any) => ({
          name: p.name,
          timeRaw: timestamp(p.last_seen),
          time: p.last_seen ? formatDistanceToNow(new Date(p.last_seen + 'Z'), { addSuffix: true }) : 'Unknown',
          location: 'Live Feed',
          type: 'known'
        }));

        const combined = [...unknowns, ...knowns]
          .sort((a, b) => b.timeRaw - a.timeRaw)
          .slice(0, 5);
          
        setRecentActivity(combined);
      } catch (err) {
        console.error("Failed to load recent activity", err);
      }
    };

    loadHeadcount();
    loadCameras();
    loadAttendance();
    loadRecentActivity();

    const interval = setInterval(() => {
      loadHeadcount();
      loadCameras();
      loadAttendance();
      loadRecentActivity();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: 'Total Active', value: headcount.total_persons, color: 'from-blue-500 to-blue-600' },
    { label: 'Known Persons', value: headcount.known_persons, color: 'from-green-500 to-green-600' },
    { label: 'Unknown Persons', value: headcount.unknown_persons, color: 'from-amber-500 to-amber-600' },
    { label: 'Tracked Today', value: trackedToday, color: 'from-purple-500 to-purple-600' },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="border-0 bg-gradient-to-br shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className={`bg-gradient-to-br ${stat.color} text-white p-4`}>
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">Updated just now</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Video Streams Grid */}
      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Live Camera Feeds</h3>
          <p className="text-sm text-muted-foreground">Real-time video streams with AI tracking</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cameras.length === 0 ? (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center p-8 bg-muted/50 rounded-xl border border-dashed border-border mt-4">
              <p className="text-muted-foreground">No cameras are currently connected. Add one from the Config menu.</p>
            </div>
          ) : (
            cameras.map((camera, idx) => (
              <motion.div
                key={camera.camera_id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.08 }}
              >
                <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="relative aspect-video bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center group overflow-hidden">
                    <VideoStream cameraId={camera.camera_id} cameraName={camera.camera_name} />
                  </div>

                  <CardContent className="p-4">
                    <h4 className="font-semibold text-foreground">{camera.camera_name}</h4>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground text-ellipsis overflow-hidden whitespace-nowrap max-w-[150px]">{camera.camera_id}</span>
                      <Badge variant="outline" className="text-xs text-green-500 border-green-500/30">Active</Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
          <CardDescription>Latest person detections and recognitions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <div className="text-center p-4 text-muted-foreground text-sm">No activity recorded yet today.</div>
            ) : (
              recentActivity.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    item.type === 'known' ? 'bg-green-500' : 'bg-amber-500'
                  }`}>
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.location}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{item.time}</span>
              </div>
            ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
