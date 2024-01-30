import {
  ChatCompletionRequestMessageRoleEnum,
  Configuration,
  OpenAIApi,
} from "openai";
import axios from "axios";
import { GenezioDeploy } from "@genezio/types";

// --- Types ---

export type Movie = {
  title: string;
  releaseDate: string;
};

export type MovieRecommendationDetails = {
  title: string;
  advantages: string;
  disadvantages: string;
};

// --- Constants ---

const movieRecommendationPrompt = (userDescription: string) =>
  // TODO 1: Write the prompt for the movie recommendation here.
  ``;

const reviewSummaryPrompt = (reviews: string[]) =>
  // TODO 3: Write the prompt for the review summary here.
  ``;
/**
 * The Movie class that will be deployed on the genezio infrastructure.
 */
@GenezioDeploy()
export class MovieService {
  openai: OpenAIApi;

  constructor() {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_SECRET_KEY,
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
  async recommendMoviesBasedOnDescription(
    userDescription: string
  ): Promise<Movie[]> {
    const prompt = movieRecommendationPrompt(userDescription);
    // TODO 2: Make a call to the OpenAI API to generate movie recommendations based on the user's description
    // Parse and return the results as an array of Movie objects.

    const response = await this.openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      temperature: 0.5, // This check is used to prevent prompt injection attacks.

      messages: [
        {
          role: ChatCompletionRequestMessageRoleEnum.User,
          content: prompt,
        },
      ],
      max_tokens: 1024,
    });

    // TODO 2.1 Check if the response contains the expected output format.
    // This check is used to prevent prompt injection attacks.
    if (
      response.data &&
      response.data.choices &&
      response.data.choices.length > 0 &&
      response.data.choices[0].message
    ) {
      try {
        const movies = JSON.parse(response.data.choices[0].message.content!);

        console.log("Get movie recommendations based on description done.");
        return movies;
      } catch (e) {
        console.error(
          "Error parsing movie recommendations",
          response.data.choices[0].message.content
        );
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
  async getProsAndConsForMovies(
    movies: Movie[]
  ): Promise<MovieRecommendationDetails[]> {
    const prosAndCons = movies.map((x: Movie) =>
      this.#getMovieReview(x.title).then(async (reviews: string[]) => {
        return await this.#getReviewSummary(reviews, x.title);
      })
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
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
      },
    };

    const response = await axios(url, options);

    return response.data.results.map((x: any) => x.content).slice(0, 3);
  }

  async #getMovieId(title: string): Promise<string> {
    const url = `https://api.themoviedb.org/3/search/movie?query=${title}&include_adult=false&language=en-US&page=1`;
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
      },
    };

    const response = await axios(url, options);
    if (
      response.data.results.length === 0 ||
      response.data.results[0].id === undefined
    ) {
      throw new Error(`Movie with title ${title} not found!`);
    }

    return response.data.results[0].id;
  }

  async #getReviewSummary(
    reviews: string[],
    title: string
  ): Promise<MovieRecommendationDetails> {
    const prompt = reviewSummaryPrompt(reviews);
    // TODO 4: Make a call to the OpenAI API to generate a summary of the reviews
    // Parse the response and return the results as a string.

    // TODO 4.1 Check if the response contains the expected output format.
    // This check is used to prevent prompt injection attacks.

    return {
      title: title,
      advantages: "",
      disadvantages: "",
    };
  }
}
