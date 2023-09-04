import AppError from '@shared/errors/AppError'
import { inject, injectable } from 'tsyringe'
import { IOrdersRepository } from '../domain/repositories/IOrdersRepository'
import { ICustomersRepository } from '@modules/customers/domain/repositories/ICustomersRepository'
import { IRequestCreateOrder } from '../domain/models/IRequestCreateOrder'
import { IOrder } from '../domain/models/IOrder'
import { IProductsRepository } from '@modules/products/domain/repositories/IProductsRepository'

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,

    @inject('ProductsRepository')
    private productsReporitory: IProductsRepository,
  ) {}

  public async execute({
    customer_id,
    products,
  }: IRequestCreateOrder): Promise<IOrder | void> {
    const customerExists = await this.customersRepository.findById(customer_id)

    if (!customerExists) {
      throw new AppError('Could not find any customer with the given id.')
    }

    const existsProducts = await this.productsReporitory.findAllByIds(products)

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

    const order = await this.ordersRepository.create({
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

    await this.productsReporitory.updateStock(updatedProductQuantity)

    return order
  }
}

export default CreateOrderService
