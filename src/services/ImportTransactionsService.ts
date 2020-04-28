import path from 'path';

import { getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import uploadConfig from '../config/upload';

import LoadCsvService from './LoadCsvService';
import FindOrCreateCategoriesService from './FindOrCreateCategoriesService';

import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  filename: string;
}
class ImportTransactionsService {
  async execute({ filename }: Request): Promise<Transaction[]> {
    const loadCsv = new LoadCsvService();
    const findOrCreateCategories = new FindOrCreateCategoriesService();

    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const csvFilePath = path.join(uploadConfig.directory, filename);

    const transactionsDTO = await loadCsv.execute({ csvFilePath });

    // eslint-disable-next-line no-restricted-syntax
    const categoryTitles = transactionsDTO.map(
      transactionDTO => transactionDTO.category,
    );

    const allCategories = await findOrCreateCategories.execute({
      titles: categoryTitles,
    });

    const transactions = transactionsRepository.create(
      transactionsDTO.map(transactionDTO => {
        return {
          title: transactionDTO.title,
          type: transactionDTO.type,
          value: transactionDTO.value,
          category: allCategories.find(category => {
            return category.title === transactionDTO.category;
          }),
        };
      }),
    );

    await transactionsRepository.save(transactions);

    return transactions;
  }
}

export default ImportTransactionsService;
