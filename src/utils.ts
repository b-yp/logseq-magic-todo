import "@logseq/libs";
import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user";

export const getTasksTree = async (block: BlockEntity | null, tasks: string[] = []): Promise<string[]> => {
  if (!block) {
    return tasks
  }

  let content: string | undefined = ''
  if (block?.marker === 'TODO') {
    content = block.content.replace(`TODO `, '')
  }
  if (block?.marker === 'LATER') {
    content = block.content.replace(`LATER `, '')
  }
  if (block?.marker === 'NOW') {
    const regex = /NOW\s+(.*?)\s*:LOGBOOK:\s*(.*?)\s*:END:/s;
    const match = block.content.match(regex);
    content = match?.[1]?.trim()
  }

  if (content) {
    const parentBlock = await logseq.Editor.getBlock(block.parent.id)
    return getTasksTree(parentBlock, [content, ...tasks])
  } else {
    return tasks
  }
}

type Params = {
  [key: string]: string | number | boolean | (string | number | boolean)[];
};

export const paramsToString = (params: Params): string => {
  const queryParams: string[] = [];

  for (const key in params) {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      const value = params[key];
      if (Array.isArray(value)) {
        value.forEach(val => {
          queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(val.toString())}`);
        });
      } else {
        queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(value.toString())}`);
      }
    }
  }

  return queryParams.join('&');
}
