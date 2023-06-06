import { ChatCompletionRequestMessageRoleEnum, Configuration, OpenAIApi } from "openai";
import dotenv from "dotenv";
import axios from "axios";
dotenv.config();

// --- Types ---

export type Movie = {
  title: string,
  releaseDate: string,
}

export type MovieRecommendationDetails = {
  title: string,
  advantages: string,
  disadvantages: string,
}

// --- Constants ---

const movieRecommendationPrompt = (userDescription: string) => (
  `Between """ """ I will write what a person says about themselves.
  Create a list with 3 movies that the person would like to watch based on the text.
  Your response is a JSON one-liner with a field called "movies" which is an array of objects
  and each object contains a field called "title" and a field called "releaseDate"
  without any additional explanations.
"""${userDescription}"""`);

const reviewSummaryPrompt = (reviews: string[]) => (
  `
  Here is a list of reviews for one movie. One review is delimited by ||| marks.
  ${reviews.map((x: string) => `|||${x.length > 100 ? x.substring(0, 100) : x}|||`).join("\n")}

  Your task is to analyze each review and give me a list of advantages and disadvantages to watch the movie.

  The result should be one JSON object with two fields "advantages" and "disadvantages".
  If there are reviews, synthesize the reviews in these two fields. The advantages should contain the positives and the disadvantages the negatives. Don't use more than 30 words for each. Don't include anything else besides the JSON.
  `
);

/**
 * The Movie class that will be deployed on the genezio infrastructure.
 */
export class MovieService {
  openai: OpenAIApi;

  constructor() {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_SECRET_KEY
    });
    this.openai = new OpenAIApi(configuration);
  }

  /**
   * Method that provides movie recommendations based on a user's input string.
   *
   * @param userDescription A string input provided by the user describing their
   *                        preferred types of movies or specific movie attributes
   *                        they are interested in.
   *
   * @returns This method returns a Promise that resolves to an array of Movie objects.
   *          Each Movie object in the array represents a recommended movie that
   *          matches the user's description.
   */
  async recommendMoviesBasedOnDescription(userDescription: string): Promise<Movie[]> {
    console.log("Get movie recommendations based on description", userDescription);
    const completion = await this.openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      temperature: 0.8,
      messages: [
        {
          'role': ChatCompletionRequestMessageRoleEnum.User,
          'content': movieRecommendationPrompt(userDescription),
        }
      ],
      max_tokens: 2048
    });

    if (completion.data && completion.data.choices && completion.data.choices.length > 0 && completion.data.choices[0].message) {
      try {
        const movies = JSON.parse(completion.data.choices[0].message.content).movies;

        console.log("Get movie recommendations based on description done.")
        return movies
      } catch (e) {
        console.log(e);
        console.error("Error parsing movie recommendations", completion.data.choices[0].message.content);
        return [];
      }
    }

    return [];
  }

  /**
   * Method that provides pros and cons analysis for a list of movie objects based on the reviews returned by TMDB API.
   *
   * @param movies An array of Movie objects. Each Movie object should represent a movie for which pros and cons will be provided.
   *
   * @returns This method returns a Promise that resolves to an array of MovieRecommendationDetails objects.
   *          Each MovieRecommendationDetails object in the array provides detailed information
   *          about the pros and cons of the corresponding Movie object from the input array.
   */
  async getProsAndConsForMovies(movies: Movie[]): Promise<MovieRecommendationDetails[]> {
    const prosAndCons = movies
    .map((x: Movie) =>
      this.#getMovieReview(x.title)
        .then(async (reviews: string[]) => {
          return await this.#getReviewSummary(x.title, reviews);
          }
        )
      );

    const result = await Promise.all(prosAndCons);

    return result;
  }

  // --- Private methods ---

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
    if (response.data.results.length === 0 || response.data.results[0].id === undefined) {
      throw new Error(`Movie with title ${title} not found!`);
    }

    return response.data.results[0].id;
  }

  async #getReviewSummary(title: string, reviews: string[]): Promise<MovieRecommendationDetails> {
    if (reviews.length === 0) {
      console.log("No reviews found!")
      return {"title":title, "advantages": "No reviews found.", "disadvantages": "No reviews found."};
    }

    const completion2 = await this.openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      temperature: 0.3,
      messages: [
        {
          'role': ChatCompletionRequestMessageRoleEnum.System,
          'content': reviewSummaryPrompt(reviews),
        }
      ],
      max_tokens: 1024
    });

    if (completion2.data && completion2.data.choices && completion2.data.choices.length > 0 && completion2.data.choices[0].message) {
      try {
        const result: { advantages: string, disadvantages: string } = JSON.parse(completion2.data.choices[0].message.content);
        console.log("Get review summary done.")
        return {"title":title, "advantages": result.advantages, "disadvantages": result.disadvantages};
      } catch (e) {
        console.log(e);
        console.error("Error parsing review summary", completion2.data.choices[0].message.content);
        return {"title":title, "advantages": "", "disadvantages": ""};
      }
    }

    return {"title":title, "advantages": "", "disadvantages": ""};
  }
}
