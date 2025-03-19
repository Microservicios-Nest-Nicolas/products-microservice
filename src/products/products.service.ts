import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Prisma, PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

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
      throw new RpcException({
        message: `Product with id #${id} not found`,
        status: HttpStatus.BAD_REQUEST,
      });
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
            throw new RpcException({
              message: `Product with id: #${id} not found`,
              status: HttpStatus.NOT_FOUND,
            });
          default:
            throw new RpcException({
              message: 'Error en la solicitud',
              status: HttpStatus.BAD_REQUEST,
            });
        }
      }
      throw new RpcException(error);
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
            throw new RpcException({
              message: `Product with id: #${id} not found`,
              status: HttpStatus.NOT_FOUND,
            });
          default:
            throw new RpcException({
              message: 'Error en la solicitud',
              status: HttpStatus.BAD_REQUEST,
            });
        }
      }
      throw new RpcException(error);
    }
  }
}
