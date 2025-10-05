"use client"

import { useToast } from "@/hooks/use-toast"

export function useNotImplementedToast() {
  const { toast } = useToast()

  const showNotImplemented = () => {
    toast({
      title: "Coming Soon",
      description: "Sorry, we're working on this feature!",
      variant: "default",
    })
  }

  return { showNotImplemented }
}
