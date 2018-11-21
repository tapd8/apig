import {Entity, model, property} from '@loopback/repository';

@model()
export class Test extends Entity {
  @property({
    type: 'number',
    id: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'array',
    itemType: 'string',
  })
  title?: string[];

  @property({
    type: 'number',
  })
  amount?: number;

  @property({
    type: 'buffer',
  })
  desc?: Buffer;

  constructor(data?: Partial<Test>) {
    super(data);
  }
}
