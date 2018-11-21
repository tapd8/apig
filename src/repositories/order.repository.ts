import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {Order} from '../models';
import {MongodbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class OrderRepository extends DefaultCrudRepository<
  Order,
  typeof Order.prototype.id
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(Order, dataSource);
  }
}
