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
  await logseq.Editor.exitEditingMode()
  logseq.Editor.exitEditingMode() // TODO: Why write it twice? Because writing it once doesn't take effect.
}

async function main() {
  console.info(`#${pluginId}: MAIN`)

  const styleEle = window.parent.document.createElement('style')
  styleEle.innerHTML = `
    .b-yp-loading {
      position: relative;
    }
    .b-yp-loading::before,
    .b-yp-loading::after {
      content: '';
      position: absolute;
      top: 0;
      right: -2em;
      width: 1.5em;
      height: 1.5em;
      border-radius: 50%;
      border: 3px solid rgba(52, 152, 219, 0.3);
      border-top-color: rgba(52, 152, 219, 1);
      animation: spin 1.5s linear infinite;
    }

    .b-yp-loading::after {
      animation-delay: 0.75s;
    }

    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    } 
  `
  window.parent.document.head.append(styleEle)

  logseq.Editor.registerSlashCommand('✅ Magic ToDo', async () => {
    await logseq.Editor.exitEditingMode()
    const block = await logseq.Editor.getCurrentBlock()
    const blockElement = window.parent.document.querySelector(`#block-content-${block?.uuid} .todo`)
    blockElement?.classList.add('b-yp-loading')
    const tasks = await getTasksTree(block)
    const task = tasks.pop()
    if (!task) return

    const params = {
      type: 'magic-todo',
      task,
      tasks
    }
    const stringParams = paramsToString(params)
    const res = await fetch(`${API}?${stringParams}`).then(res => res.json())
    await setTodos(block, res)
    blockElement?.classList.remove('b-yp-loading')
  })
}

logseq.ready(main).catch(console.error)
