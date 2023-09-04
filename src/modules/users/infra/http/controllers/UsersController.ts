import { Request, Response } from 'express'
import { container } from 'tsyringe'
import ListUserService from '../../../services/ListUserService'
import CreateUserService from '../../../services/CreateUserService'
import ShowUserService from '../../../services/ShowUserService'
import UpdateUserService from '../../../services/UpdateUserService'
import DeleteUserService from '../../../services/DeleteUserService'
import { instanceToInstance } from 'class-transformer'

export default class UsersController {
  public async index(request: Request, response: Response): Promise<Response> {
    const page = request.query.page ? Number(request.query.page) : 1
    const limit = request.query.limit ? Number(request.query.limit) : 15
    const listUser = container.resolve(ListUserService)

    const users = await listUser.execute({ page, limit })

    return response.json(instanceToInstance(users))
  }

  public async show(request: Request, response: Response): Promise<Response> {
    const { id } = request.params

    const showUser = container.resolve(ShowUserService)

    const user = await showUser.execute({ id })

    return response.json(user)
  }

  public async create(request: Request, response: Response): Promise<Response> {
    const { name, email, password } = request.body

    const createUser = container.resolve(CreateUserService)

    const user = await createUser.execute({
      name,
      email,
      password,
    })

    return response.json(instanceToInstance(user))
  }

  public async update(request: Request, response: Response): Promise<Response> {
    const { id } = request.params

    const { name, email } = request.body

    const updateUser = container.resolve(UpdateUserService)

    const user = await updateUser.execute({ id, name, email })

    return response.json(instanceToInstance(user))
  }

  public async delete(request: Request, response: Response): Promise<Response> {
    const { id } = request.params

    const deleteUser = container.resolve(DeleteUserService)

    await deleteUser.execute({ id })

    return response.json([])
  }
}
