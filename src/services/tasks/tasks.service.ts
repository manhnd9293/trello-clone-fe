import { TaskCreateDto } from '@/services/tasks/task-create.dto.ts';
import { httpClient } from '@/services/http-client/http-client.ts';
import { Task } from '@/services/tasks/task.ts';

export class TasksService {
  static addTask(data: TaskCreateDto):Promise<Task> {
    return httpClient.post('/tasks', data);
  }
}
