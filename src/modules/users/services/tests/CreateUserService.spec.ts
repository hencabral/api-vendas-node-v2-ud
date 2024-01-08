import 'reflect-metadata'
import FakeUsersRepository from '@modules/users/domain/repositories/fakes/FakeUsersRepository'
import AppError from '@shared/errors/AppError'
import FakeHashProvider from '@modules/users/providers/HashProvider/fakes/FakeHashProvider'
import CreateUserService from '../CreateUserService'

let fakeUsersRepository: FakeUsersRepository
let createUser: CreateUserService
let fakeHashProvider: FakeHashProvider

describe('CreateUser', () => {
  beforeEach(() => {
    fakeUsersRepository = new FakeUsersRepository()
    fakeHashProvider = new FakeHashProvider()
    createUser = new CreateUserService(fakeUsersRepository, fakeHashProvider)
  })

  it('should be able to create a new user', async () => {
    const user = await createUser.execute({
      name: 'Luiz Henrique',
      email: 'henrique@dev.com.br',
      password: '123456',
    })

    expect(user).toHaveProperty('id')
  })

  it('should not be able to create two users with the same email', async () => {
    await createUser.execute({
      name: 'Luiz Henrique',
      email: 'henrique@dev.com.br',
      password: '123456',
    })

    expect(
      createUser.execute({
        name: 'Luiz Henrique',
        email: 'henrique@dev.com.br',
        password: '123456',
      }),
    ).rejects.toBeInstanceOf(AppError)
  })
})
