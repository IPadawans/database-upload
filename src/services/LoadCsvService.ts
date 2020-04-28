import csvParse from 'csv-parse';
import fs from 'fs';

interface Request {
  csvFilePath: string;
}
interface TransactionDTO {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class LoadCsvService {
  async execute({ csvFilePath }: Request): Promise<TransactionDTO[]> {
    const readCSVSStream = fs.createReadStream(csvFilePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVSStream.pipe(parseStream);

    const lines: TransactionDTO[] = [];

    parseCSV.on('data', line => {
      const [title, type, value, category] = line;
      lines.push({
        title,
        type,
        value,
        category,
      });
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    return lines;
  }
}

export default LoadCsvService;
