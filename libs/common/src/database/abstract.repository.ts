import { AbstractDocument } from '@app/common/database/abstract.schema';
import { FilterQuery, Model, Types, UpdateQuery } from 'mongoose';
import {
  Logger,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { filter } from 'rxjs';

export abstract class AbstractRepository<TDocument extends AbstractDocument> {
  protected abstract readonly logger: Logger;

  constructor(private readonly model: Model<TDocument>) {}

  async create(document: Omit<TDocument, '_id'>): Promise<TDocument> {
    const createdDocument = new this.model({
      ...document,
      _id: new Types.ObjectId(),
    });
    return (await createdDocument.save()).toJSON() as unknown as TDocument;
  }

  async findOne(filterQuery: FilterQuery<TDocument>): Promise<TDocument> {
    const document = await this.model
      .findOne(filterQuery)
      .lean<TDocument>(true);

    if (!document) {
      this.logger.warn(
        `Document not found with filter: ${JSON.stringify(filterQuery)}`,
      );
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  async findOneAndUpdate(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
  ): Promise<TDocument> {
    const document = await this.model
      .findOneAndUpdate(filterQuery, update, { new: true })
      .lean<TDocument>(true);

    if (!document) {
      this.logger.warn(
        `Document not found with filter: ${JSON.stringify(filterQuery)}`,
      );
      throw new NotFoundException('Document not found');
    }
    return document;
  }

  async find(filterQuery: FilterQuery<TDocument>): Promise<TDocument[]> {
    return this.model.find(filterQuery).lean<TDocument[]>(true);
  }

  async findOneAndDelete(
    filterQuery: FilterQuery<TDocument>,
  ): Promise<TDocument> {
    return await this.model.findOneAndDelete(filterQuery).lean<TDocument>(true);
  }
}
