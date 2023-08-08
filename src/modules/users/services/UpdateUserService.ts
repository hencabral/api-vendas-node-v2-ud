import { getCustomRepository } from 'typeorm'
import AppError from '@shared/errors/AppError'
import UsersRepository from '../typeorm/repositories/UserRepository'
import User from '../typeorm/entities/User'

interface IRequest {
  id: string
  name: string
  email: string
}

class UpdateUserService {
  public async execute({ id, name, email }: IRequest): Promise<User> {
    const usersRepository = getCustomRepository(UsersRepository)

    const user = await usersRepository.findOne(id)

    if (!user) {
      throw new AppError('User not found.')
    }

    const userEmailExists = await usersRepository.findByEmail(email)

    if (userEmailExists && email != user.email) {
      throw new AppError('There is already one user with this email.')
    }

    user.name = name
    user.email = email

    await usersRepository.save(user)

    return user
  }
}

export default UpdateUserService
