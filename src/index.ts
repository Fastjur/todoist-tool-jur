import { Task, TodoistApi } from '@doist/todoist-api-typescript'
import * as dotenv from 'dotenv'
import dayjs from 'dayjs'
import weekday from 'dayjs/plugin/weekday.js'

dotenv.config()

if (process.env.TODOIST_API_TOKEN == null) {
  throw new Error('Missing TODOIST_API_TOKEN environment variable')
}

dayjs.extend(weekday)

const api = new TodoistApi(process.env.TODOIST_API_TOKEN)

const DRY_RUN = process.env.DRY_RUN !== 'false'
const PROJECT_ID = (process.env.PROJECT_ID != null) ? parseInt(process.env.PROJECT_ID) : undefined
const SECTION_ID = (process.env.SECTION_ID != null) ? parseInt(process.env.SECTION_ID) : undefined
const LABEL_ID = (process.env.LABEL_ID != null) ? parseInt(process.env.LABEL_ID) : null
const WEEKS_TO_ADD = process.env.WEEKS_TO_ADD ?? 3

const startingDate = dayjs().weekday(3)

const promises: Array<Promise<Task>> = []
for (let i = 0; i < WEEKS_TO_ADD; i++) {
  const dueDate = startingDate.add(7 * i, 'day').set('hour', 9).set('minute', 0).set('second', 0).set('millisecond', 0)
  const notBefore = dueDate.subtract(2, 'day').set('hour', 15).set('minute', 0).set('second', 0).set('millisecond', 0)
  const args = {
    content: 'Notulen lezen',
    description: `[2h] (notbefore ${notBefore.format('YYYY-MM-DD HH:mm')})`,
    dueString: dueDate.format('YYYY-MM-DD'),
    labelIds: LABEL_ID != null ? [LABEL_ID] : undefined,
    priority: 4,
    projectId: PROJECT_ID,
    sectionId: SECTION_ID,
    order: i
  }
  if (!DRY_RUN) {
    promises.push(
      api.addTask(args)
    )
  } else {
    console.log('Adding task with:')
    console.table(args)
  }
}

const tasks = await Promise.all(promises)

console.log(`Added ${tasks.length} tasks with ids ${tasks.map(t => t.id).toString()}`)
