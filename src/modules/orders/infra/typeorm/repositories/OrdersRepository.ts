import { Repository, getRepository } from 'typeorm'
import Order from '../entities/Order'
import { IOrdersRepository } from '@modules/orders/domain/repositories/IOrdersRepository'
import { IOrderPaginate } from '@modules/orders/domain/models/IOrderPaginate'
import { ICreateOrder } from '@modules/orders/domain/models/ICreateOrder'
import { IOrder } from '@modules/orders/domain/models/IOrder'
import { SearchParams } from '@modules/customers/domain/repositories/ICustomersRepository'

export default class OrdersRepository implements IOrdersRepository {
  private ormRepository: Repository<Order>

  constructor() {
    this.ormRepository = getRepository(Order)
  }

  public async create({ customer, products }: ICreateOrder): Promise<Order> {
    const order = this.ormRepository.create({
      customer,
      order_products: products,
    })

    await this.ormRepository.save(order)

    return order
  }

  public async save(order: IOrder): Promise<IOrder> {
    await this.ormRepository.save(order)

    return order
  }

  public async findById(id: string): Promise<Order | undefined> {
    const order = await this.ormRepository.findOne({
      where: { id },
      relations: ['order_products', 'customer'],
    })

    return order
  }

  public async findAll({
    page,
    skip,
    take,
  }: SearchParams): Promise<IOrderPaginate> {
    const [orders, count] = await this.ormRepository
      .createQueryBuilder()
      .skip(skip)
      .take(take)
      .getManyAndCount()

    const result = {
      per_page: take,
      total: count,
      current_page: page,
      data: orders,
    }

    return result
  }
}
