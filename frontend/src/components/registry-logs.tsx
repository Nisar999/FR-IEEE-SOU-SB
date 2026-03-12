'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import axios from 'axios'
import { formatDistanceToNow } from 'date-fns'

export default function RegistryLogs() {
  const [unknownPersons, setUnknownPersons] = useState<any[]>([])
  const [knownPersons, setKnownPersons] = useState<any[]>([])

  const fetchLogs = async () => {
    try {
      const [unknownRes, knownRes] = await Promise.all([
        axios.get('http://localhost:8000/unknown-persons'),
        axios.get('http://localhost:8000/today-attendance')
      ])
      
      const parsedUnknowns = unknownRes.data.map((p: any) => ({
        id: p.track_id,
        trackId: p.track_id,
        lastSeen: p.last_seen ? formatDistanceToNow(new Date(p.last_seen + 'Z'), { addSuffix: true }) : 'Unknown',
        confidence: 0.85,
        camera: 'Live Feed'
      }))

      const parsedKnowns = knownRes.data.map((p: any, idx: number) => ({
        id: p.track_id || idx,
        name: p.name,
        lastSeen: p.last_seen ? formatDistanceToNow(new Date(p.last_seen + 'Z'), { addSuffix: true }) : 'Unknown',
        camera: 'Live Feed',
        count: 1
      }))

      setUnknownPersons(parsedUnknowns)
      setKnownPersons(parsedKnowns)
    } catch (err) {
      console.error("Failed to fetch logs", err)
    }
  }

  useEffect(() => {
    fetchLogs()
    const interval = setInterval(fetchLogs, 5000)
    return () => clearInterval(interval)
  }, [])

  const [selectedUnknown, setSelectedUnknown] = useState<typeof unknownPersons[0] | null>(null)
  const [promoteSearch, setPromoteSearch] = useState('')

  const handlePromoteToKnown = (id: number) => {
    const name = promoteSearch || `Person_${id}`
    alert(`Promoted unknown person #${id} to known with name: ${name}`)
    setUnknownPersons(unknownPersons.filter(p => p.id !== id))
    setSelectedUnknown(null)
    setPromoteSearch('')
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="known" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-background border border-border rounded-lg p-1">
          <TabsTrigger value="known" className="rounded">Known Persons</TabsTrigger>
          <TabsTrigger value="unknown" className="rounded">Unknown Persons</TabsTrigger>
        </TabsList>

        <TabsContent value="known" className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Today's Attendance</h3>
            <p className="text-sm text-muted-foreground">Recognized persons tracked today</p>
          </div>

          <div className="space-y-3">
            {knownPersons.map((person) => (
              <Card key={person.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-lg">
                        {person.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{person.name}</h4>
                        <p className="text-xs text-muted-foreground">{person.camera}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-300">
                        Seen {person.count}x
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-2">{person.lastSeen}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="unknown" className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Unknown Persons Archive</h3>
            <p className="text-sm text-muted-foreground">Unrecognized individuals detected today</p>
          </div>

          <div className="space-y-3">
            {unknownPersons.map((person) => (
              <Card 
                key={person.id} 
                className={`border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer ${
                  selectedUnknown?.id === person.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedUnknown(selectedUnknown?.id === person.id ? null : person)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold text-lg">
                        ?
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">Unknown Person #{person.id}</h4>
                        <p className="text-xs text-muted-foreground">{person.camera} • {person.trackId}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-amber-500 hover:bg-amber-600">
                        {(person.confidence * 100).toFixed(0)}% Match
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-2">{person.lastSeen}</p>
                    </div>
                  </div>

                  {selectedUnknown?.id === person.id && (
                    <div className="mt-4 pt-4 border-t border-border space-y-3">
                      <div>
                        <label className="text-sm font-medium text-foreground">Assign Name</label>
                        <Input
                          placeholder="Enter person's name..."
                          value={promoteSearch}
                          onChange={(e) => setPromoteSearch(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handlePromoteToKnown(person.id)}
                          className="mt-2"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handlePromoteToKnown(person.id)}
                          className="flex-1 bg-primary hover:bg-primary/90"
                        >
                          Promote to Known
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setSelectedUnknown(null)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {unknownPersons.length === 0 && (
            <Card className="border-0 shadow-lg bg-background/50">
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-3">✓</div>
                <p className="text-foreground font-medium">All persons have been identified</p>
                <p className="text-sm text-muted-foreground mt-1">No unknown persons in the archive</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
