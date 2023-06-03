/**
* This is an auto generated code. This code should not be modified since the file can be overwriten
* if new genezio commands are executed.
*/

import { Remote } from "./remote";

export type Book = {title: string, publishYear: string};
export type BookRecommendationDetails = {advantages: Array<string>, disadvantages: Array<string>};

export class BookService {
  static remote = new Remote("http://127.0.0.1:8083/BookService");

  static async recommendBooksBasedOnDescription(userDescription: string): Promise<Array<Book>> {
    return await BookService.remote.call("BookService.recommendBooksBasedOnDescription", userDescription);
  }
  static async getPronsAndConsForBooks(books: Array<Book>): Promise<BookRecommendationDetails> {
    return await BookService.remote.call("BookService.getPronsAndConsForBooks", books);
  }
}

export { Remote };
