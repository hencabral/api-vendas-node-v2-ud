import { getCustomRepository } from 'typeorm'
import AppError from '@shared/errors/AppError'
import CustomersRepository from '../infra/typeorm/repositories/CustomersRepository'
import Customer from '../infra/typeorm/entities/Customer'

interface IRequest {
  id: string
  name: string
  email: string
}

class UpdateCustomerService {
  public async execute({ id, name, email }: IRequest): Promise<Customer> {
    const customersRepository = getCustomRepository(CustomersRepository)

    const customer = await customersRepository.findById(id)

    if (!customer) {
      throw new AppError('Customer not found.')
    }

    const customerExists = await customersRepository.findByEmail(email)

    if (customerExists && email != customer.email) {
      throw new AppError('There is already one customer with this email.')
    }

    customer.name = name
    customer.email = email

    await customersRepository.save(customer)

    return customer
  }
}

export default UpdateCustomerService
