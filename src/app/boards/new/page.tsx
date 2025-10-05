"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Users, Lock, Unlock, Check } from "lucide-react"
import Link from "next/link"

const templates = [
  {
    value: "start-stop-continue",
    label: "Start/Stop/Continue",
    description: "Identify what to start doing, stop doing, and continue doing",
    columns: ["Start", "Stop", "Continue"],
  },
  {
    value: "mad-sad-glad",
    label: "Mad/Sad/Glad",
    description: "Express emotions about what happened during the sprint",
    columns: ["Mad", "Sad", "Glad"],
  },
  {
    value: "4ls",
    label: "4Ls",
    description: "Reflect on what you liked, learned, lacked, and longed for",
    columns: ["Liked", "Learned", "Lacked", "Longed For"],
  },
  {
    value: "sailboat",
    label: "Sailboat",
    description: "Identify anchors (holding back) and wind (helping forward)",
    columns: ["Anchors", "Wind", "Rocks", "Island"],
  },
  {
    value: "what-went-well",
    label: "What Went Well / What Needs Improvement",
    description: "Simple format focusing on successes and areas for growth",
    columns: ["What Went Well", "What Needs Improvement", "Action Items"],
  },
]

export default function NewBoardPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [template, setTemplate] = useState("")
  const [description, setDescription] = useState("")
  const [teamMembers, setTeamMembers] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)
  const [allowAnonymous, setAllowAnonymous] = useState(true)
  const [enableVoting, setEnableVoting] = useState(true)
  const [errors, setErrors] = useState<{ name?: string; template?: string; submit?: string }>({})
  const [isCreating, setIsCreating] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Clear previous errors
    setErrors({})

    // Validation
    const newErrors: { name?: string; template?: string } = {}
    if (!name.trim()) {
      newErrors.name = "Board name is required"
    }
    if (!template) {
      newErrors.template = "Please select a template"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsCreating(true)

    try {
      const response = await fetch("/api/boards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          template,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create board")
      }

      const createdBoard = await response.json()
      
      // Navigate to the created board
      router.push(`/boards/${createdBoard.id}`)
    } catch (error) {
      console.error("Error creating board:", error)
      setErrors({
        submit: error instanceof Error ? error.message : "Failed to create board"
      })
    } finally {
      setIsCreating(false)
    }
  }

  const selectedTemplate = templates.find((t) => t.value === template)

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/boards"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Boards
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Create New Board</h1>
          <p className="text-muted-foreground text-lg">
            Set up a new retrospective board with detailed configuration options
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Give your board a name and description</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Board Name *</Label>
                <Input
                  id="name"
                  placeholder="Sprint 24 Retrospective"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (errors.name) setErrors({ ...errors, name: undefined })
                  }}
                  aria-invalid={!!errors.name}
                  className="text-base"
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Add context, goals, or any important information for this retrospective..."
                  className="resize-none min-h-[100px] text-base"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">Optional: Provide context for your team</p>
              </div>
            </CardContent>
          </Card>

          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Template *</CardTitle>
              <CardDescription>Choose a retrospective format that fits your team&aposs needs</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={template}
                onValueChange={(value) => {
                  setTemplate(value)
                  if (errors.template) setErrors({ ...errors, template: undefined })
                }}
              >
                <div className="space-y-3">
                  {templates.map((t) => (
                    <div
                      key={t.value}
                      className={`relative flex items-start space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-colors ${
                        template === t.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground/50"
                      }`}
                      onClick={() => {
                        setTemplate(t.value)
                        if (errors.template) setErrors({ ...errors, template: undefined })
                      }}
                    >
                      <RadioGroupItem value={t.value} id={t.value} className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor={t.value} className="text-base font-semibold cursor-pointer">
                          {t.label}
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {t.columns.map((col) => (
                            <span key={col} className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
                              {col}
                            </span>
                          ))}
                        </div>
                      </div>
                      {template === t.value && <Check className="h-5 w-5 text-primary flex-shrink-0" />}
                    </div>
                  ))}
                </div>
              </RadioGroup>
              {errors.template && <p className="text-sm text-destructive mt-2">{errors.template}</p>}
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members
              </CardTitle>
              <CardDescription>Invite team members to collaborate on this board</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="team-members">Email Addresses</Label>
                <Textarea
                  id="team-members"
                  placeholder="Enter email addresses separated by commas&#10;example: alice@company.com, bob@company.com"
                  className="resize-none min-h-[80px] text-base font-mono text-sm"
                  value={teamMembers}
                  onChange={(e) => setTeamMembers(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">Optional: Invite team members via email</p>
              </div>
            </CardContent>
          </Card>

          {/* Board Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Board Settings</CardTitle>
              <CardDescription>Configure privacy and collaboration options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center gap-2">
                    {isPrivate ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                    <Label htmlFor="private" className="text-base font-semibold">
                      Private Board
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">Only invited team members can view and contribute</p>
                </div>
                <Switch id="private" checked={isPrivate} onCheckedChange={setIsPrivate} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex-1">
                  <Label htmlFor="anonymous" className="text-base font-semibold">
                    Allow Anonymous Cards
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Team members can submit cards without showing their name
                  </p>
                </div>
                <Switch id="anonymous" checked={allowAnonymous} onCheckedChange={setAllowAnonymous} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex-1">
                  <Label htmlFor="voting" className="text-base font-semibold">
                    Enable Voting
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Allow team members to vote on cards to prioritize discussion
                  </p>
                </div>
                <Switch id="voting" checked={enableVoting} onCheckedChange={setEnableVoting} />
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {errors.submit && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <p className="text-sm text-destructive">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button 
              type="button" 
              variant="outline" 
              size="lg" 
              onClick={() => router.push("/boards")}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" size="lg" disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Board"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
