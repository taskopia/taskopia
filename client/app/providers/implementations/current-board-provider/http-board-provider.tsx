import { useEffect, useState } from "react";
import { TaskopiaAPI } from "..";
import {
  CreateTaskInput,
  CurrentBoardProvider,
  CurrentUserProvider,
  EditTaskInput,
} from "../../interfaces";
import { QueryOf } from "@/app/types/query";
import { Board, Task } from "@/app/types";
import { BoardProviderActionsHandler } from "./board-provider-actions-handler";

export function HttpBoardProvider(
  boardAPI: TaskopiaAPI,
  currentUserProvider: CurrentUserProvider
): CurrentBoardProvider {
  const [currentBoardQuery, setCurrentBoardQuery] = useState<QueryOf<Board>>({
    isLoading: true,
    data: undefined,
    error: undefined,
  });
  const currentUser = currentUserProvider.currentUser().data;

  const { addActionToQueue } = BoardProviderActionsHandler({
    boardAPI,
    currentBoardQuery,
    setBoardQueryState: setCurrentBoardQuery,
  });

  useEffect(() => {
    async function fetchCurrentBoard(currentUserId: string) {
      try {
        setCurrentBoardQuery({
          isLoading: true,
          data: undefined,
          error: undefined,
        });

        const board = await boardAPI.getBoard(currentUserId);
        setCurrentBoardQuery({
          isLoading: false,
          data: board,
          error: null,
        });
      } catch (error: any) {
        setCurrentBoardQuery({
          isLoading: false,
          data: undefined,
          error: error,
        });
      }
    }

    if (currentUser) fetchCurrentBoard(currentUser.id);
  }, [currentUser?.id]);

  // optimistic update: add the task to the board before the server responds, then update the task with the server response
  const optimisticAddTask = async (task: CreateTaskInput) => {
    if (!currentBoardQuery.data) {
      throw new Error("No board loaded");
    }

    const newTask: Task = {
      // generate fake id
      id: "fake" + Math.random().toString(36).substring(7),
      title: task.title,
      description: task.description,
      tags: [],
      taskListId: task.taskListId,
      positionInList: task.positionInList,
    };

    const newBoard: Board = {
      ...currentBoardQuery.data,
      taskLists: currentBoardQuery.data?.taskLists.map((taskList) => {
        if (taskList.id === task.taskListId) {
          return {
            ...taskList,
            tasks: [...taskList.tasks, newTask],
          };
        }
        return taskList;
      }),
    };

    setCurrentBoardQuery({
      isLoading: false,
      data: newBoard,
      error: null,
    });

    addActionToQueue({
      type: "ADD_TASK",
      actionResult: newTask,
      actionInput: task,
    });
  };

  const optimisticEditTask = async (task: EditTaskInput) => {
    if (!currentBoardQuery.data) {
      throw new Error("No board loaded");
    }

    const currentTask = currentBoardQuery.data.taskLists
      .flatMap((taskList) => taskList.tasks)
      .find((t) => t.id === task.id);
    if (!currentTask) {
      throw new Error("Task not found");
    }

    const updatedTask: Task = {
      ...currentTask,
      title: task.title,
      description: task.description,
    };

    const newBoard: Board = {
      ...currentBoardQuery.data,
      taskLists: currentBoardQuery.data.taskLists.map((taskList) => {
        return {
          ...taskList,
          tasks: taskList.tasks.map((t) => {
            if (t.id === task.id) {
              return updatedTask;
            }
            return t;
          }),
        };
      }),
    };

    setCurrentBoardQuery({
      isLoading: false,
      data: newBoard,
      error: null,
    });

    addActionToQueue({
      type: "EDIT_TASK",
      actionResult: updatedTask,
      actionInput: task,
    });
  }

  return {
    currentBoard: () => {
      return currentBoardQuery;
    },
    createTask: optimisticAddTask,
    editTask: optimisticEditTask,
  };
}
