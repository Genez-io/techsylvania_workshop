import { ChatCompletionRequestMessageRoleEnum, Configuration, OpenAIApi } from "openai";
import dotenv from "dotenv";
import axios from "axios";
dotenv.config();

export type Movie = {
  title: string,
  releaseDate: string,
}

export type MovieRecommendationDetails = {
  title: string,
  advantages: string,
  disadvantages: string,
}

/**
 * The Task server class that will be deployed on the genezio infrastructure.
 */
export class MovieService {
  openai: OpenAIApi;

  constructor() {
    // console.log(process.env.OPENAI_SECRET_KEY);
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_SECRET_KEY
    });
    this.openai = new OpenAIApi(configuration);
  }

  async recommendMoviesBasedOnDescription(userDescription: string): Promise<Movie[]> {
    // console.log("User description is " + userDescription);
    console.log("Get movie recommendations based on description", userDescription);
    const completion = await this.openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          'role': ChatCompletionRequestMessageRoleEnum.System,
          'content': `The user will write what they say about themselves. Create a list with 3 movies that the user would like to watch based on the text. Create the output as JSON without any aditional text, note or informations a one-liner with a field called "movies" which is an array of objects and each object contains a field called "title" and a field called "releaseDate" without any additional explanations.`
        },
        {role: ChatCompletionRequestMessageRoleEnum.User, content: userDescription}
      ],
      max_tokens: 2048
    });

    if (completion.data && completion.data.choices && completion.data.choices.length > 0 && completion.data.choices[0].message) {
      try {
        const movies = JSON.parse(completion.data.choices[0].message.content).movies;

        console.log("Get movie recommendations based on description done.")
        return movies
      } catch (e) {
        console.log("Error parsing movie recommendations", completion.data.choices[0].message.content);
        return [];
      }
    }

    return [];
  }

  async getPronsAndConsForBooks(movie: Movie[]): Promise<MovieRecommendationDetails[]> {
    // Make post request with axios using headers
    const prosAndConss = movie
      .map((x: Movie) =>
        this.#getMovieReview(x.title)
          .then(async (reviews: string[]) => {
            console.log(`Reviews for title ${x.title} ${reviews}`);
            const summary = await this.#getReviewSummary(reviews);

            try {
              const result: { advantages: string, disadvantages: string } = JSON.parse(summary);

              return {
                title: x.title,
                ...result
              }
            } catch (e) {
              console.log("Error parsing movie review summary", summary);
              return {
                title: x.title,
                advantages: "",
                disadvantages: ""
              }
            }
          }
          )
      );


    const result = await Promise.all(prosAndConss);

    return result;
  }

  async #getMovieReview(movieTitle: string): Promise<any> {
    const id = await this.#getMovieId(movieTitle);

    return this.#getMovieReviews(id);
  }

  async #getMovieReviews(id: string): Promise<string[]> {
    const url = `https://api.themoviedb.org/3/movie/${id}/reviews?language=en-US&page=1`;
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${process.env.TMDB_API_KEY}`
      }
    };

    const response = await axios(url, options)

    return response.data.results.map((x: any) => x.content).slice(0, 3);
  }

  async #getMovieId(title: string): Promise<string> {
    const url = `https://api.themoviedb.org/3/search/movie?query=${title}&include_adult=false&language=en-US&page=1`;
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${process.env.TMDB_API_KEY}`
      }
    };

    const response = await axios(url, options)
    return response.data.results[0].id;
  }

  async #getReviewSummary(reviews: string[]): Promise<string> {
    const prompt2 = `
    Here is a list of reviews for one movie. One review is delimited by ||| marks.
    ${reviews.map((x: string) => `|||${x.length > 100 ? x.substring(0, 100) : x}|||`).join("\n")}
    
    Your task is to analyze each review and give me a list of advantages and disadvantages to read the book.
    
    The result should be one JSON object with two fields "advantages" and "disadvantages". 
    Synthesize the reviews in these two fields. The advantages should contain the positives and the disadvantages the negatives. Don't use more than 30 words for each. Don't include anything else besides the JSON.
    `

    const completion2 = await this.openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          'role': ChatCompletionRequestMessageRoleEnum.System,
          'content': prompt2,
          'name': "test",
        }
      ],
      max_tokens: 2048
    });

    return completion2.data.choices[0].message!.content;
  }
}
