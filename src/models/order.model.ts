import {Entity, model, property} from '@loopback/repository';

@model()
export class Order extends Entity {
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
    required: true,
  })
  title: string[];

  @property({
    type: 'number',
  })
  amount?: number;

  @property({
    type: 'buffer',
  })
  desc?: Buffer;

  constructor(data?: Partial<Order>) {
    super(data);
  }
}
