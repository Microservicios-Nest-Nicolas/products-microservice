import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Prisma, PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('ProductsService');

  onModuleInit() {
    this.$connect();
    this.logger.log('Database Conected');
  }

  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto,
    });
  }
  /**
   * Recupera una lista paginada de productos junto con metadatos sobre la paginación.
   *
   * @param paginatioDto - Un objeto que contiene los parámetros de paginación:
   *   - `page`: El número de la página actual (índice basado en 1).
   *   - `limit`: La cantidad de elementos a recuperar por página.
   *
   * @returns Un objeto que contiene:
   *   - `data`: Un arreglo de productos para la página actual.
   *   - `meta`: Metadatos sobre la paginación, incluyendo:
   *     - `totalPages`: El número total de productos.
   *     - `page`: El número de la página actual.
   *     - `lastPage`: El número de la última página basado en el total de productos y el límite.
   *
   * @throws Lanzará un error si la transacción con la base de datos falla.
   */
  async findAll(paginatioDto: PaginationDto) {
    const { page, limit } = paginatioDto;

    // 1 sola consulta con PromiseAll para hacer ambas consultas y mejorar el rendimiento
    const [products, totalPages] = await this.$transaction([
      this.product.findMany({
        where: { available: true },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.product.count({
        where: {
          available: true,
        },
      }),
    ]);

    const lastPage = Math.ceil(totalPages / limit);

    return {
      data: products,
      meta: {
        totalPages: totalPages,
        page: page,
        lastPage: lastPage,
      },
    };
  }

  async findOne(id: number) {
    const product = await this.product.findFirst({
      where: { id: id, available: true },
    });
    if (!product) {
      throw new NotFoundException(`Product with id: #${id} not found`);
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { id: __, ...data } = updateProductDto;
    try {
      // Se hacen 2 consultas en una sola transaccion
      const [__, productUpdate] = await this.$transaction([
        this.product.findFirstOrThrow({
          where: { id: id, available: true },
        }),
        this.product.update({
          where: { id: id },
          data: data,
        }),
      ]);
      return productUpdate;
    } catch (error) {
      // Respondemos conforme al codigo de error de prisma
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2025': // Registro no encontrado
            throw new NotFoundException(`Product with id: #${id} not found`);
          default:
            throw new BadRequestException('Error en la solicitud');
        }
      }
      throw new InternalServerErrorException();
    }
  }

  async remove(id: number) {
    try {
      // Se hacen 2 consultas en una sola transaccion
      const [__, productDeleted] = await this.$transaction([
        this.product.findFirstOrThrow({
          where: { id: id, available: true },
        }),
        this.product.update({
          where: { id: id },
          data: { available: false }, // Ensure 'available' exists in the schema
        }),
      ]);
      return productDeleted;
    } catch (error) {
      // Respondemos conforme al codigo de error de prisma
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2025': // Registro no encontrado
            throw new NotFoundException(`Product with id: #${id} not found`);
          default:
            throw new BadRequestException('Error en la solicitud');
        }
      }
      throw new InternalServerErrorException();
    }
  }
}
