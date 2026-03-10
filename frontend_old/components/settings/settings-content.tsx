"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

export function SettingsContent() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage system configuration and preferences
        </p>
      </div>

      {/* General */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base font-medium">General</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="orgName">Organization Name</Label>
              <Input id="orgName" defaultValue="Stanford University" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="adminEmail">Admin Email</Label>
              <Input
                id="adminEmail"
                defaultValue="admin@insightface.ai"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Input id="timezone" defaultValue="America/Los_Angeles (PST)" />
          </div>
        </CardContent>
      </Card>

      {/* Recognition Settings */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Recognition Engine
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                Auto-Recognition
              </p>
              <p className="text-xs text-muted-foreground">
                Automatically mark attendance on face detection
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                Liveness Detection
              </p>
              <p className="text-xs text-muted-foreground">
                Prevent spoofing with anti-liveness checks
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex flex-col gap-2">
            <Label htmlFor="threshold">
              Confidence Threshold (%)
            </Label>
            <Input
              id="threshold"
              type="number"
              defaultValue="85"
              className="max-w-[120px]"
            />
            <p className="text-xs text-muted-foreground">
              Minimum confidence score for automatic attendance marking
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                Email Alerts
              </p>
              <p className="text-xs text-muted-foreground">
                Receive alerts for low attendance or camera issues
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                Unknown Face Alerts
              </p>
              <p className="text-xs text-muted-foreground">
                Get notified when an unrecognized face is detected
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pb-6">
        <Button variant="outline">Cancel</Button>
        <Button>Save Changes</Button>
      </div>
    </div>
  )
}
