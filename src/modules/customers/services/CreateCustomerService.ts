import AppError from '@shared/errors/AppError'
import { getCustomRepository } from 'typeorm'
import CustomersRepository from '../typeorm/repositories/CustomersRepository'
import Customer from '../typeorm/entities/Customer'

interface IRequest {
  name: string
  email: string
}

class CreateCustomerService {
  public async execute({ name, email }: IRequest): Promise<Customer> {
    const customersRepository = getCustomRepository(CustomersRepository)

    const emailExists = await customersRepository.findByEmail(email)

    if (emailExists) {
      throw new AppError('Email address already used.')
    }

    const customer = customersRepository.create({
      name,
      email,
    })
    await customersRepository.save(customer)

    return customer
  }
}

export default CreateCustomerService
