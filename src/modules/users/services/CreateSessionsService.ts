import AppError from '@shared/errors/AppError'
import { getCustomRepository } from 'typeorm'
import authConfig from '@config/auth'
import User from '../infra/typeorm/entities/User'
import UsersRepository from '../infra/typeorm/repositories/UserRepository'
import { compare, hash } from 'bcryptjs'
import { sign } from 'jsonwebtoken'

interface IRequest {
  email: string
  password: string
}

interface IResponse {
  user: User
  token: string
}

class CreateSessionsService {
  public async execute({ email, password }: IRequest): Promise<IResponse> {
    const usersRepository = getCustomRepository(UsersRepository)

    const user = await usersRepository.findByEmail(email)

    if (!user) {
      throw new AppError('Incorrect email/password combination.', 401)
    }

    const passwordConfirmed = await compare(password, user.password)

    if (!passwordConfirmed) {
      throw new AppError('Incorrect email/password combination.', 401)
    }

    const token = await sign({}, authConfig.jwt.secret, {
      subject: user.id,
      expiresIn: authConfig.jwt.expiresIn,
    })

    return { user, token }
  }
}

export default CreateSessionsService
