import { TaskCreateDto } from '@/services/tasks/task-create.dto.ts';
import { httpClient } from '@/services/http-client/http-client.ts';
import { Task } from '@/services/tasks/task.ts';
import { TaskPositionUpdateDto } from '@/services/tasks/task-position-update.dto.ts';

export class TasksService {
  static addTask(data: TaskCreateDto):Promise<Task> {
    return httpClient.post('/tasks', data);
  }

  static updateTaskPosition(data: TaskPositionUpdateDto): Promise<Task> {
    return httpClient.patch('/tasks/position', data);
  }
}
