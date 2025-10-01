"use client";

import { useEffect, useState, use } from "react";
import { useSession } from "@/lib/auth-client";
import {
  Button,
  Link,
  TextFieldInput
} from "@radix-ui/themes";

export default function BoardSettings({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const boardId: string = slug;

  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [boardName, setBoardName] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/board", {
          method: "POST",
          body: JSON.stringify({ boardId }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Error fetching board data.");
        }
        const jsonData = await response.json();
        const dynamoItem = jsonData.Item;

        setBoardName(dynamoItem.board_name);
        console.log(dynamoItem);

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
  }, [userId, boardId]);

  return (
    <div className="bg-gray-800 text-white min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl mb-4">Project Settings</h2>

        <div className="bg-gray-700 p-6 rounded-lg space-y-6">
          <div>
            <h3 className="text-lg mb-2">Board Name</h3>
            <div className="flex items-center justify-between">
              <TextFieldInput placeholder={`${boardName}`} />
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Save
              </button>
            </div>
          </div>
          <div>
            <h3 className="text-lg mb-2">Board Password</h3>
            <div className="flex items-center justify-between">
              <TextFieldInput placeholder={`${boardName}`} />
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Save
              </button>
            </div>
          </div>

          {/* Repeat similar blocks for each section */}
        </div>
      </div>
    </div>
  );
}
