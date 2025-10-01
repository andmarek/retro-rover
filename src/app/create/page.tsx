"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { Cross1Icon, PlusIcon } from "@radix-ui/react-icons";
import { useSession } from "@/lib/auth-client";
import {
  Heading,
  Button,
  TextField,
} from "@radix-ui/themes"


const initialTemplate = "Classic";

const classicTemplate = [
  { columnName: "What went well?" },
  { columnName: "What went wrong?" },
  { columnName: "Action Items" },
]
const twoColumnTemplate = [
  { columnName: "What went well?" },
  { columnName: "What went wrong?" },
]

const testingTemplate = [
  { columnName: "Test1" },
  { columnName: "Test2" },
]

const templateOptions = {
  "Classic": classicTemplate,
  "Two Column": twoColumnTemplate,
  "Testing": testingTemplate,
};



export default function CreateBoard() {
  const [boardName, setBoardName] = useState("");
  const [boardDescription, setBoardDescription] = useState("");
  const [boardColumns, setBoardColumns] = useState(templateOptions[initialTemplate]);
  const [columnCount, setColumnCount] = useState(boardColumns.length);
  const [selectedTemplate, setSelectedTemplate] = useState("Classic");
  const [useTemplate, setUseTemplate] = useState(true);

  const router = useRouter();
  const { data: session } = useSession();

  async function submitForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const boardId = uuidv4();
    const userId = session?.user?.id;

    if (!userId) {
      console.error("User not authenticated");
      return;
    }

    console.log(boardId, boardName, boardDescription, boardColumns)

    try {
      const response = await fetch("/api/board", {
        method: "PUT",
        body: JSON.stringify({
          boardId,
          boardName,
          boardDescription,
          boardColumns,
          userId
        }),
        headers: {
          "Content-Type": "application/json"
        },
      });
      const responseBodyJson = await response.json();

      if (response.ok) {
        router.push(`board/${boardId}`)
      } else {
        console.log("Server responded with an error: ", responseBodyJson);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  function addColumn() {
    setColumnCount(columnCount + 1);
    setBoardColumns(prevBoardColumns => [...prevBoardColumns, { columnName: "" }])
  }

  function handleTemplateSelection(templateToSelect: string, changeUseTemplate?: boolean) {
    setSelectedTemplate(templateToSelect);
    if (changeUseTemplate) {
      const updatedColumns = templateOptions[templateToSelect].map((columns) => ({
        ...columns,
        columnName: columns.columnName,
      }));
      setBoardColumns(updatedColumns);
      setColumnCount(templateOptions[templateToSelect].length);
    }
  }

  function changeColumnName(text: string, key: number) {
    setBoardColumns(prevBoardColumns => {
      const newBoardColumns = [...prevBoardColumns];
      //newBoardColumns[key].columnName = text;
      newBoardColumns[key] = {
        ...newBoardColumns[key],
        columnName: text,
      };
      return newBoardColumns;
    })
  }

  function removeColumn(key: number) {
    setColumnCount(columnCount - 1);
    setBoardColumns(prevBoardColumns => {
      const newBoardColumns = [...prevBoardColumns];
      newBoardColumns.splice(key, 1);
      return newBoardColumns;
    })
  }

  function handleCustomSelection() {
    setUseTemplate(false);
    setBoardColumns([]);
    setColumnCount(0);
  }

  return (
    <div className="flex justify-center bg-base-900 bg-opacity-60 w-96 mx-auto my-3 rounded-md section-create">
      <form className="flex flex-col w-96 p-2 mx-2" onSubmit={submitForm}>
        <div className="my-2">
          <div className="flex flex-col space-y-2 my-2">
            <Heading className="self-center">Board Name</Heading>
            <TextField.Input name="boardName" onChange={(e) => { setBoardName(e.target.value) }} placeholder="Enter a board name..."></TextField.Input>
          </div>
          <div className="flex flex-col space-y-2 my-2">
            <Heading className="self-center">Board Description</Heading>
            <TextField.Input name="boardDescription" onChange={(e) => { setBoardDescription(e.target.value) }} placeholder="Enter a board description..."></TextField.Input>
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <Heading className="self-center">
            Columns Options
          </Heading>
          <label>
            <input
              type="radio"
              name="templateRadio"
              value="template"
              checked={useTemplate === true}
              onChange={() => { setUseTemplate(true); handleTemplateSelection(selectedTemplate, true); }}
            /> I want to use a template
          </label>
          <label>
            <input
              type="radio"
              name="customRadio"
              value="custom"
              checked={useTemplate === false}
              onChange={() => handleCustomSelection()}
            /> I want my own custom columns
          </label>
          <div className="flex flex-col space-y-2">
            <Heading className="self-center"> Template Selection </Heading>
            <select className="self-center" value={selectedTemplate} onChange={(e) => handleTemplateSelection(e.target.value, useTemplate)}>
              <option value="Classic">Classic Retrospective</option>
              <option value="Two Column">Two Column</option>
              <option value="Testing">Testing</option>
            </select>
          </div>
        </div>
        <div className="my-3">
          <label className="flex flex-row place-items-center justify-center space-x-2">
            <Heading>Current Columns</Heading>
            <PlusIcon className="cursor-pointer opacity-50 hover:opacity-100" onClick={addColumn} />
          </label>
          <ul className="flex flex-col space-y-2 my-2 place-items-center">
            {boardColumns.map((column, index) => (
              <li key={index} className="flex flex-row place-items-center space-x-2">
                <TextField.Input name={`column-${index}`} onChange={(e) => changeColumnName(e.target.value, index)} value={column.columnName}></TextField.Input>
                <Cross1Icon className="hover:text-coolors-red text-red-light cursor-pointer" onClick={() => removeColumn(index)} />
              </li>
            )
            )}
          </ul>
        </div>
        <Button className="my-2 self-center w-2/3"> Create Board </Button>
      </form>
    </div>
  )
}
