import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  id: string;
}
class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    try {
      const transactionsRepository = getCustomRepository(
        TransactionsRepository,
      );

      const existentRepository = await transactionsRepository.findOne(id);

      if (!existentRepository) {
        throw new AppError('Transaction do not exists');
      }

      await transactionsRepository.delete(existentRepository.id);
    } catch {
      throw new AppError('Transaction do not exists');
    }
  }
}

export default DeleteTransactionService;
