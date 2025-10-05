"use client";

import { use } from "react";
import { RetroBoard } from "@/components/board/RetroBoard";
import { Header } from "@/components/header";
import NavBar from "@/app/navbar";

export default function BoardPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = use(params);
  
  return (
    <>
      <Header />
      <RetroBoard boardId={slug} />
    </>
  );
}
