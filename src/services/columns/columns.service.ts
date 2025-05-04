import { Column } from '@/services/columns/column.ts';
import { httpClient } from '@/services/http-client/http-client.ts';

export class ColumnsService{
  public static addColumn(name: string): Promise<Column>  {
    return httpClient.post('/columns', {
      name
    })
  }

  public static async getAllColumns(): Promise<Column[]> {
    return await httpClient.get('/columns');

  }
}
