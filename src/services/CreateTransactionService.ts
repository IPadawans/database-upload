import { getCustomRepository } from 'typeorm';

import Transaction from '../models/Transaction';

import TransactionRepository from '../repositories/TransactionsRepository';

import FindOrCreateCategoriesService from './FindOrCreateCategoriesService';

import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}
class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);

    if (!['outcome', 'income'].includes(type)) {
      throw new AppError('Type must be income or outcome');
    }

    if (type === 'outcome') {
      const balance = await transactionRepository.getBalance();
      if (balance.total - value < 0) {
        throw new AppError('Value exceed your total in balance');
      }
    }

    const findOrCreateCategories = new FindOrCreateCategoriesService();

    const categoryForTransaction = await findOrCreateCategories.execute({
      titles: [category],
    });

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: categoryForTransaction[0].id,
      category: categoryForTransaction[0],
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
