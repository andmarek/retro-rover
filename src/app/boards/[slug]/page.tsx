"use client";

import { use } from "react";
import { RetroBoard } from "@/components/board/RetroBoard";

export default function BoardPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = use(params);
  
  return <RetroBoard boardId={slug} />;
}
