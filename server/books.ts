import { ChatCompletionRequestMessageRoleEnum, Configuration, OpenAIApi } from "openai";
import dotenv from "dotenv";
import axios from "axios";
dotenv.config();

export type Book = {
  title: string,
  publishYear: string,
}

export type BookRecommendationDetails = {
  advantages: string[],
  disadvantages: string[],
}

/**
 * The Task server class that will be deployed on the genezio infrastructure.
 */
export class BookService {
  openai: OpenAIApi;

  constructor() {
    console.log(process.env.OPENAI_SECRET_KEY);
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_SECRET_KEY
    });
    this.openai = new OpenAIApi(configuration);
  }

  async recommendBooksBasedOnDescription(userDescription: string): Promise<Book[]> {
    console.log("User description is " + userDescription);

    const completion = await this.openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          'role': ChatCompletionRequestMessageRoleEnum.System,
          'content': `Between """ """ I will write what a person says about themselves. Create a list with 3 books that the person would like to read based on the text. Create the output as JSON one-liner with a field called "books" which is an array of objects and each object contains a field called "title" and a field called "publishYear" without any additional explanations.

          """
          ${userDescription}
          """`,
          'name': "test",
        }
      ],
      max_tokens: 2048
    });
    console.log("Input: ", userDescription);
    console.log(
      `DEBUG: response: |${completion.data.choices[0].message!.content}|`
    );

    if (completion.data && completion.data.choices && completion.data.choices.length > 0 && completion.data.choices[0].message) {
      return JSON.parse(completion.data.choices[0].message.content).books
    }

    return [];
  }

  async getPronsAndConsForBooks(books: Book[]): Promise<BookRecommendationDetails> {
    // Make post request with axios using headers


    return {
      advantages: ["It is a very good book", "It is a very good book", "It is a very good book"],
      disadvantages: ["It is a very bad book", "It is a very bad book", "It is a very bad book"],
    };
  }

  async #makeGoodReadsRequest(bookTitle: string): Promise<any> {
    const options = {
      method: 'GET',
      url: 'https://goodreads-books.p.rapidapi.com/search',
      params: {
        q: bookTitle,
        page: '1'
      },
      headers: {
        'X-RapidAPI-Key': '2eab96136fmsh09ecd38f8402354p1365b9jsn948b94a94da5',
        'X-RapidAPI-Host': 'goodreads-books.p.rapidapi.com'
      }
    };

    try {
      const response = await axios.request(options);
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  }
}
