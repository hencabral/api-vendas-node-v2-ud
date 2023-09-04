import { getRepository, Repository } from 'typeorm'
import Customer from '../entities/Customer'
import { ICustomersRepository } from '@modules/customers/domain/repositories/ICustomersRepository'
import { ICreateCustomer } from '@modules/customers/domain/models/ICreateCustomer'
import { ICustomer } from '@modules/customers/domain/models/ICustomer'
import { ICustomerPaginate } from '@modules/customers/domain/models/ICustomerPaginate'
import { SearchParams } from '../../../domain/repositories/ICustomersRepository'

class CustomersRepository implements ICustomersRepository {
  private ormRepository: Repository<Customer>

  constructor() {
    this.ormRepository = getRepository(Customer)
  }

  public async create({ name, email }: ICreateCustomer): Promise<Customer> {
    const customer = this.ormRepository.create({ name, email })

    await this.ormRepository.save(customer)

    return customer
  }

  public async save(customer: ICustomer): Promise<ICustomer> {
    await this.ormRepository.save(customer)

    return customer
  }

  public async remove(customer: Customer): Promise<void> {
    await this.ormRepository.remove(customer)
  }

  public async findAll({
    page,
    skip,
    take,
  }: SearchParams): Promise<ICustomerPaginate> {
    const [customers, count] = await this.ormRepository
      .createQueryBuilder()
      .skip(skip)
      .take(take)
      .getManyAndCount()

    const result = {
      per_page: take,
      total: count,
      current_page: page,
      data: customers,
    }

    return result
  }

  public async findByName(name: string): Promise<Customer | undefined> {
    const customer = await this.ormRepository.findOne({
      name,
    })

    return customer
  }

  public async findById(id: string): Promise<Customer | undefined> {
    const customer = await this.ormRepository.findOne({
      id,
    })

    return customer
  }

  public async findByEmail(email: string): Promise<Customer | undefined> {
    const customer = await this.ormRepository.findOne({
      email,
    })

    return customer
  }
}

export default CustomersRepository
