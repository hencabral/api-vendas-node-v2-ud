import { getCustomRepository } from 'typeorm'
import AppError from '@shared/errors/AppError'
import UsersRepository from '../typeorm/repositories/UserRepository'
import User from '../typeorm/entities/User'

interface IRequest {
  id: string
}

class ShowUserService {
  public async execute({ id }: IRequest): Promise<User> {
    const usersRepository = getCustomRepository(UsersRepository)

    const user = await usersRepository.findOne(id)

    if (!user) {
      throw new AppError('User not found.')
    }

    return user
  }
}

export default ShowUserService
