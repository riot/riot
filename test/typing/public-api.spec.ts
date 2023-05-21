import {
  RiotComponent,
  mount,
  unmount,
  register,
  unregister,
  version,
  RiotComponentWrapper,
} from '../../riot'

interface TodoItem {
  summary: string
  done: boolean
}

interface TodoProps {
  initialItems: [TodoItem]
}

interface TodoState {
  items: [TodoItem]
  doShowDoneItems: boolean
}

interface TodoComponent extends RiotComponent<TodoProps, TodoState> {}

const wrapper: RiotComponentWrapper<TodoComponent> = {}

const component: TodoComponent = mount<TodoProps, TodoState>(
  'todo',
  {
    initialItems: [{ summary: 'buy eggs', done: false }],
  },
  'todo',
)[0]

component.update({ doShowDoneItems: false }, {})
component.unmount(true)

const el = document.createElement('div')
unmount(el)
register('todo', wrapper)
unregister('todo')

el.innerHTML = version
