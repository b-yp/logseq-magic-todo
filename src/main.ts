import "@logseq/libs";

import { logseq as PL } from "../package.json";
import { getTasksTree, paramsToString } from "./utils";
import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user";

const pluginId = PL.id;

const BASE_URL = 'https://api.ypll.xyz'
const API = `${BASE_URL}/api/deepseek`

const setTodos = async (block: BlockEntity | null, todos: string[]) => {
  if (!block) return
  const marker = block.marker
  const newTodos = todos.map((i: string) => `${marker} ${i}`)

  await logseq.Editor.insertBatchBlock(block.uuid, newTodos.map(i => ({ content: i })), { sibling: false })
  logseq.Editor.exitEditingMode()
}

async function main() {
  console.info(`#${pluginId}: MAIN`)

  logseq.Editor.registerSlashCommand('✅ Magic ToDo', async () => {
    const block = await logseq.Editor.getCurrentBlock()
    console.log('block', block)
    const tasks = await getTasksTree(block)
    console.log('tasks', tasks)
    const task = tasks.pop()
    if (!task) return

    const params = {
      type: 'magic-todo',
      task,
      tasks
    }
    const stringParams = paramsToString(params)
    const res = await fetch(`${API}?${stringParams}`).then(res => res.json())
    console.log('res', res)

    setTodos(block, res)
  })
}

logseq.ready(main).catch(console.error)
