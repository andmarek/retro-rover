"use client";
import Board from "./Board";
import { use } from "react";

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const boardId: string = slug;

  return (
    <Board boardId={boardId} />
  )
}
