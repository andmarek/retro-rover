"use client";
import { useSession } from "@/lib/auth-client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Link,
} from "@radix-ui/themes";

import { MagnifyingGlassIcon, PlusIcon } from "@radix-ui/react-icons";


export default function NewBoards() {
  const [boards, setBoards] = useState([]);
  const [filteredBoards, setFilteredBoards] = useState([]);

  const { data: session } = useSession();
  const userId = session?.user?.id;

  function handleSearch(event) {
    const searchKeyword = event.target.value.toLowerCase();
    if (searchKeyword === "") {
      // If the search input is empty, fetch the original list of boards
      setFilteredBoards(boards);
    } else {
      const filtered = boards.filter((board) =>
        board.BoardName.toLowerCase().includes(searchKeyword)
      );
      setFilteredBoards(filtered);
    }
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/boards", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Error fetching board data.");
        }
        const jsonData = await response.json();
        setBoards(jsonData);
        setFilteredBoards(jsonData);
        return jsonData;
      } catch (error) {
        console.error("Error initializing board page.");
      }
    };

    if (userId) {
      fetchData();
    } else {
      return;
    }
  }, [userId]);

  async function handleDeleteBoard(boardId: string) {
    const newBoards = boards.filter((board) => board.BoardId !== boardId);
    setBoards(newBoards);
    try {
      const response = await fetch("/api/board", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          boardId,
          userId,
        }),
      });
      if (response.ok) {
        await response.json();
      } else {
        console.error("Error deleting board.");
      }
    } catch (error) {
      console.error("error");
    }
  }
  return (
    <div className="flex flex-col space-y-3 py-2">
      <div className="flex flex-col self-center space-x-2 w-11/12 sm:w-3/4">
        <SearchBar handleSearch={handleSearch} />
        <BoardGrid boards={filteredBoards} handleDeleteBoard={handleDeleteBoard} />
      </div>
    </div>
  );
  
  function SearchBar({ handleSearch }) {
    return (
      <div className="flex flex-row px-2 py-2 items-center space-x-2 justify-center">
        <div className="flex flex-row border-base-900 border rounded-md items-center space-x-2">
          <MagnifyingGlassIcon className="mx-2 text-base-850" />
          <input
            onChange={handleSearch}
            className="text-lg sm:text-xl bg-base-black rounded-md outline-none p-2"
            placeholder="Search boards..."
          />
        </div>
        <form action="/create">
          <Button size="2" variant="soft"><PlusIcon /></Button>
        </form>
      </div>
    );
  }
  
  function BoardGrid({ boards, handleDeleteBoard }) {
    return (
      <div className="flex justify-center items-center w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full mx-auto">
          {boards.map((board) => (
            <BoardCard
              key={board.BoardId}
              board={board}
              handleDeleteBoard={handleDeleteBoard}
            />
          ))}
        </div>
      </div>
    );
  }
  
  function BoardCard({ board, handleDeleteBoard }) {
    return (
      <div className="flex flex-col p-2 border border-base-800 rounded-lg hover:border-base-600 transition-all duration-300 w-full min-h-[16rem]">
        <Link href={`/board/${board.BoardId}`}>
          <a className="text-lg">{board.BoardName}</a>
        </Link>
        <span className="italic text-sm sm:text-base">
          {new Date(board.DateCreated).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
        <div className="flex items-center med:space-x-2 mt-2 lg:flex-row sm:flex-col lg:space-y-0 sm:space-y-2">
          <Button variant="soft" className="cursor-pointer" onClick={() => handleDeleteBoard(board.BoardId)}>Delete</Button>
          <Button variant="soft">
            <Link href={`/board/${board.BoardId}/settings`}>
              <a className="btn-variant-soft cursor-pointer">Settings</a>
            </Link>
          </Button>
        </div>
      </div>
    );
  }
  
  
}
