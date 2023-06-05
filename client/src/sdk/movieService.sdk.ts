/**
* This is an auto generated code. This code should not be modified since the file can be overwriten
* if new genezio commands are executed.
*/

import { Remote } from "./remote";

export type Movie = {title: string, releaseDate: string};
export type MovieRecommendationDetails = {title: string, advantages: string, disadvantages: string};

export class MovieService {
  static remote = new Remote("http://127.0.0.1:8083/MovieService");

  static async recommendMoviesBasedOnDescription(userDescription: string): Promise<Array<Movie>> {
    return await MovieService.remote.call("MovieService.recommendMoviesBasedOnDescription", userDescription);
  }
  static async getPronsAndConsForMovies(movies: Array<Movie>): Promise<Array<MovieRecommendationDetails>> {
    return await MovieService.remote.call("MovieService.getPronsAndConsForMovies", movies);
  }
}

export { Remote };
