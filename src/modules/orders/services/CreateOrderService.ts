import { getCustomRepository } from 'typeorm'
import AppError from '@shared/errors/AppError'
import OrdersRepository from '../infra/typeorm/repositories/OrdersRepository'
import CustomersRepository from '@modules/customers/infra/typeorm/repositories/CustomersRepository'
import { ProductRepository } from '@modules/products/infra/typeorm/repositories/ProductsRepository'
import Order from '../infra/typeorm/entities/Order'

interface IProduct {
  id: string
  quantity: number
}

interface IRequest {
  customer_id: string
  products: IProduct[]
}

class CreateOrderService {
  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const ordersRepository = getCustomRepository(OrdersRepository)
    const customersRepository = getCustomRepository(CustomersRepository)
    const productsReporitory = getCustomRepository(ProductRepository)

    const customerExists = await customersRepository.findById(customer_id)

    if (!customerExists) {
      throw new AppError('Could not find any customer with the given id.')
    }

    const existsProducts = await productsReporitory.findAllByIds(products)

    if (!existsProducts.length) {
      throw new AppError('Could not find any products with the given ids.')
    }

    const existsProductsIds = existsProducts.map(product => product.id)

    const checkInexistentProducts = products.filter(
      product => !existsProductsIds.includes(product.id),
    )

    if (checkInexistentProducts.length) {
      throw new AppError(
        `Could not find product ${checkInexistentProducts[0].id}.`,
      )
    }

    const quantityAvaliable = products.filter(
      product =>
        existsProducts.filter(p => p.id === product.id)[0].quantity <
        product.quantity,
    )

    if (quantityAvaliable.length) {
      throw new AppError(
        `The ${quantityAvaliable[0].quantity} is not available for ${quantityAvaliable[0].id}`,
      )
    }

    const serializedProducts = products.map(product => ({
      product_id: product.id,
      quantity: product.quantity,
      price: existsProducts.filter(p => p.id === product.id)[0].price,
    }))

    const order = await ordersRepository.createOrder({
      customer: customerExists,
      products: serializedProducts,
    })

    const { order_products } = order

    const updatedProductQuantity = order_products.map(product => ({
      id: product.product_id,
      quantity:
        existsProducts.filter(p => p.id === product.product_id)[0].quantity -
        product.quantity,
    }))

    await productsReporitory.save(updatedProductQuantity)

    return order
  }
}

export default CreateOrderService
