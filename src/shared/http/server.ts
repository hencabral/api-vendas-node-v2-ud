import 'reflect-metadata'
import 'dotenv/config'
import express, { NextFunction, Request, Response } from 'express'
import 'express-async-errors'
import cors from 'cors'
import { errors } from 'celebrate'
import { pagination } from 'typeorm-pagination'
import routes from './routes'
import AppError from '@shared/errors/AppError'
import '@shared/typeorm'
import uploadConfig from '@config/upload'
import rateLimiter from '@shared/http/middlewares/rateLimiter'

const app = express()

app.use(cors())
app.use(express.json())

app.use(rateLimiter)

app.use(pagination)

app.use('/files', express.static(uploadConfig.directory))
app.use(routes)

app.use(errors())

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    })
  }

  return res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
  })
})

app.listen(3333, () => console.log('Server started on port 3333!'))
