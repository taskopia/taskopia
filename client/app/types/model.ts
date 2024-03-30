export type User = {
    id: string;
    name: string;
    email: string;
}

export type Task = {
    id: string;
    name: string;
    description: string;
    tags: string[];
    dueDate?: Date;
    positionInList: number;
    taskListId: string;
}

export type TaskList = {
    id: string;
    name: string;
    positionInBoard: number;
    tasks: Task[];
}

export type Board = {
    id: string;
    taskLists: TaskList[];
}