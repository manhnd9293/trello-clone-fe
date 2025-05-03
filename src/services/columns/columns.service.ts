import { Column } from '@/services/columns/column.ts';
import { httpClient } from '@/services/http-client/http-client.ts';

export class ColumnsService{
  public static addColumn(name: string): Promise<Column>  {
    return httpClient.post('/columns', {
      name
    })
  }

  public static async getAllColumns(): Promise<{ [key: string] : Column }> {
    const columns: Column[] = await httpClient.get('/columns');
    const idToColumn : {[key: string]: Column} = {};
    for(const column of columns) {
      idToColumn[column.id] = column
    }

    return idToColumn;
  }
}
