"use client"

import type React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Check, Lock, Unlock, Users } from "lucide-react"

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

    setErrors({})

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
    <div className="relative min-h-screen bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white/60 to-transparent dark:from-white/5" />

      <div className="relative mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-10">
          <Link
            href="/boards"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to boards
          </Link>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
            Create board
          </h1>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-300 sm:text-lg">
            Fill out the form below to create a new retrospective board.
          </p>

          {selectedTemplate ? (
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              Selected template: <span className="font-medium text-slate-950 dark:text-white">{selectedTemplate.label}</span>
            </p>
          ) : null}
        </div>

        <form onSubmit={handleSubmit} className="space-y-7">
          <section className="space-y-5 rounded-[22px] border border-slate-200 bg-white p-7 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Board details</h2>
              <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
                Give the board a clear name and optional description.
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="name" className="text-base font-medium text-slate-900 dark:text-white">Board name</Label>
              <Input
                id="name"
                placeholder="Sprint 24 retrospective"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (errors.name) setErrors({ ...errors, name: undefined })
                }}
                aria-invalid={!!errors.name}
                className="h-12 rounded-xl border-slate-300 bg-white px-4 text-base text-slate-950 placeholder:text-slate-400 focus-visible:ring-slate-400 dark:border-white/15 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus-visible:ring-white/20"
              />
              {errors.name ? <p className="text-sm text-destructive">{errors.name}</p> : null}
            </div>

            <div className="space-y-3">
              <Label htmlFor="description" className="text-base font-medium text-slate-900 dark:text-white">Description</Label>
              <Textarea
                id="description"
                placeholder="Optional details for your team"
                className="min-h-[140px] resize-y rounded-xl border-slate-300 bg-white px-4 py-3 text-base text-slate-950 placeholder:text-slate-400 focus-visible:ring-slate-400 dark:border-white/15 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus-visible:ring-white/20"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </section>

          <section className="space-y-5 rounded-[22px] border border-slate-200 bg-white p-7 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Template</h2>
              <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
                Choose the retrospective format you want to use.
              </p>
            </div>

            <RadioGroup
              value={template}
              onValueChange={(value) => {
                setTemplate(value)
                if (errors.template) setErrors({ ...errors, template: undefined })
              }}
              className="space-y-3"
            >
              {templates.map((t) => {
                const selected = template === t.value

                return (
                  <label
                    key={t.value}
                    htmlFor={t.value}
                    className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-5 transition-colors ${
                      selected
                        ? "border-slate-900 bg-slate-50 dark:border-white dark:bg-white/5"
                        : "border-slate-200 bg-white hover:border-slate-300 dark:border-white/10 dark:bg-slate-950/40 dark:hover:border-white/20"
                    }`}
                  >
                    <RadioGroupItem
                      value={t.value}
                      id={t.value}
                      className="mt-1 border-slate-400 text-slate-900 dark:border-white/40 dark:text-white"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-xl font-medium text-slate-950 dark:text-white">{t.label}</div>
                          <p className="mt-2 text-base text-slate-600 dark:text-slate-300">{t.description}</p>
                        </div>
                        {selected ? <Check className="mt-1 h-4 w-4 text-slate-900 dark:text-white" /> : null}
                      </div>

                      <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
                        Columns: {t.columns.join(", ")}
                      </p>
                    </div>
                  </label>
                )
              })}
            </RadioGroup>

            {errors.template ? <p className="text-sm text-destructive">{errors.template}</p> : null}
          </section>

          <section className="space-y-5 rounded-[22px] border border-slate-200 bg-white p-7 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Team members</h2>
                <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
                  Optionally add teammate email addresses.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="team-members" className="text-base font-medium text-slate-900 dark:text-white">Email addresses</Label>
              <Textarea
                id="team-members"
                placeholder="alice@company.com, bob@company.com"
                className="min-h-[140px] resize-y rounded-xl border-slate-300 bg-white px-4 py-3 text-base text-slate-950 placeholder:text-slate-400 focus-visible:ring-slate-400 dark:border-white/15 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus-visible:ring-white/20"
                value={teamMembers}
                onChange={(e) => setTeamMembers(e.target.value)}
              />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Separate addresses with commas or new lines.
              </p>
            </div>
          </section>

          <section className="space-y-5 rounded-[22px] border border-slate-200 bg-white p-7 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Board settings</h2>
              <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
                Adjust privacy and collaboration options.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 p-5 dark:border-white/10">
                <div className="pr-4">
                  <div className="flex items-center gap-2 text-base font-medium text-slate-950 dark:text-white">
                    {isPrivate ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                    <Label htmlFor="private">Private board</Label>
                  </div>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Only invited team members can access the board.
                  </p>
                </div>
                <Switch id="private" checked={isPrivate} onCheckedChange={setIsPrivate} />
              </div>

              <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 p-5 dark:border-white/10">
                <div className="pr-4">
                  <div className="text-base font-medium text-slate-950 dark:text-white">
                    <Label htmlFor="anonymous">Allow anonymous cards</Label>
                  </div>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Team members can post without showing their name.
                  </p>
                </div>
                <Switch id="anonymous" checked={allowAnonymous} onCheckedChange={setAllowAnonymous} />
              </div>

              <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 p-5 dark:border-white/10">
                <div className="pr-4">
                  <div className="text-base font-medium text-slate-950 dark:text-white">
                    <Label htmlFor="voting">Enable voting</Label>
                  </div>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Let the team vote on cards to prioritize discussion.
                  </p>
                </div>
                <Switch id="voting" checked={enableVoting} onCheckedChange={setEnableVoting} />
              </div>
            </div>
          </section>

          {errors.submit ? (
            <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
              {errors.submit}
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/boards")}
              disabled={isCreating}
              className="rounded-xl border-slate-300 bg-white px-5 text-slate-700 hover:bg-slate-50 hover:text-slate-950 dark:border-white/15 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating}
              className="rounded-xl bg-slate-900 px-5 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            >
              {isCreating ? "Creating board..." : "Create board"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
