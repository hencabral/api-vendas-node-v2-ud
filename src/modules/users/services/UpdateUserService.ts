import AppError from '@shared/errors/AppError'
import User from '../infra/typeorm/entities/User'
import { IUpdateUser } from '../domain/models/IUpdateUser'
import { inject, injectable } from 'tsyringe'
import { IUsersRepository } from '../domain/repositories/IUsersRepository'

@injectable()
class UpdateUserService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
  ) {}
  public async execute({ id, name, email }: IUpdateUser): Promise<User> {
    const user = await this.usersRepository.findById(id)

    if (!user) {
      throw new AppError('User not found.')
    }

    const userEmailExists = await this.usersRepository.findByEmail(email)

    if (userEmailExists && email != user.email) {
      throw new AppError('There is already one user with this email.')
    }

    user.name = name
    user.email = email

    await this.usersRepository.save(user)

    return user
  }
}

export default UpdateUserService
