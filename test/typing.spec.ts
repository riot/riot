import {
  RiotComponentShell,
  RiotComponent,
  mount,
  unmount,
  register,
  unregister,
} from "../riot";

interface TodoItem {
  summary: string;
  done: boolean;
}

interface TodoProps {
  initialItems: [TodoItem]
}

interface TodoState {
  items: [TodoItem]
  doShowDoneItems: boolean;
}

interface TodoComponentShell extends RiotComponentShell<TodoProps, TodoState> {
}

interface TodoComponent extends RiotComponent<TodoProps, TodoState> {
}

//  equivalent to `import todo from "todo"`
let todo: TodoComponentShell

let component: TodoComponent = mount<TodoProps, TodoState>("todo", "todo", {
  initialItems: [
    { summary: "buy eggs", done: false}
  ]
})[0]

component.update({ doShowDoneItems: false }, { })
component.unmount(true)
