import { getRepository, In } from 'typeorm';
import Category from '../models/Category';

interface RequestMany {
  titles: string[];
}

class FindOrCreateCategoriesService {
  async execute({ titles }: RequestMany): Promise<Category[]> {
    const categoriesRepository = getRepository(Category);

    const uniqueTitles = Array.from(new Set(titles));
    const existentCategories = await categoriesRepository.find({
      where: { title: In(uniqueTitles) },
    });

    const titlesOfExistentCategories = existentCategories.map(
      category => category.title,
    );

    const categoriesToBeCreated = uniqueTitles.filter(
      category => !titlesOfExistentCategories.includes(category),
    );

    if (!categoriesToBeCreated) {
      return existentCategories;
    }

    const createdCategories = categoriesRepository.create(
      categoriesToBeCreated.map(category => ({
        title: category,
      })),
    );

    await categoriesRepository.save(createdCategories);

    return [...existentCategories, ...createdCategories];
  }
}

export default FindOrCreateCategoriesService;
