/**
* This is an auto generated code. This code should not be modified since the file can be overwriten
* if new genezio commands are executed.
*/

import { Remote } from "./remote";

export type Movie = {title: string, releaseDate: string};
export type MovieRecommendationDetails = {title: string, advantages: string, disadvantages: string};

export class MovieService {
  static remote = new Remote("https://krg63i4r6qkidzdhdzgatd5jpi0ftpnt.lambda-url.us-east-1.on.aws/MovieService");

  static async recommendMoviesBasedOnDescription(userDescription: string): Promise<Array<Movie>> {
    return await MovieService.remote.call("MovieService.recommendMoviesBasedOnDescription", userDescription);
  }
  static async getPronsAndConsForBooks(movie: Array<Movie>): Promise<Array<MovieRecommendationDetails>> {
    return await MovieService.remote.call("MovieService.getPronsAndConsForBooks", movie);
  }
}

export { Remote };
