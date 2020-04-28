import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const initialValues = {
      income: 0,
      outcome: 0,
      total: 0,
    };

    const transactions = await this.find();
    const balance = transactions.reduce(
      (accumulator: Balance, actual: Transaction) => {
        const { type } = actual;
        accumulator[type] += Number(actual.value);
        accumulator.total = accumulator.income - accumulator.outcome;
        return accumulator;
      },
      initialValues,
    );

    return balance;
  }

  public async all(): Promise<Transaction[]> {
    const transactions = await this.find({
      relations: ['category'],
    });
    return transactions;
  }
}

export default TransactionsRepository;
