import { Router } from 'express'
import UsersController from '../controllers/UsersController'
import { celebrate, Joi, Segments } from 'celebrate'
import multer from 'multer'
import uploadConfig from '@config/upload'
import isAuthenticated from '@shared/infra/http/middlewares/isAuthenticated'
import UserAvatarController from '../controllers/UserAvatarController'

const usersRouter = Router()

const usersController = new UsersController()
const usersAvatarController = new UserAvatarController()

const upload = multer(uploadConfig.multer)

usersRouter.get('/', isAuthenticated, usersController.index)

usersRouter.get(
  '/:id',
  celebrate({
    [Segments.PARAMS]: {
      id: Joi.string().uuid().required(),
    },
  }),
  usersController.show,
)

usersRouter.post(
  '/',
  celebrate({
    [Segments.BODY]: {
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    },
  }),
  usersController.create,
)

usersRouter.put(
  '/:id',
  celebrate({
    [Segments.BODY]: {
      name: Joi.string().required(),
      email: Joi.string().email().required(),
    },
  }),
  celebrate({
    [Segments.PARAMS]: {
      id: Joi.string().uuid().required(),
    },
  }),
  usersController.update,
)

usersRouter.delete(
  '/:id',
  celebrate({
    [Segments.PARAMS]: {
      id: Joi.string().uuid().required(),
    },
  }),
  usersController.delete,
)

usersRouter.patch(
  '/avatar',
  isAuthenticated,
  upload.single('avatar'),
  usersAvatarController.update,
)

export default usersRouter
