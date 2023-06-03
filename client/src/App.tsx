import "bootstrap/dist/css/bootstrap.min.css";
import { Input } from "reactstrap";
import { useState } from "react";
import { Movie, MovieRecommendationDetails, MovieService } from "./sdk/movieService.sdk";

export default function App() {
  const [moviesLoaded, setMoviesLoaded] = useState<boolean>(false);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [movieRecommendationDetails, setMovieRecommendationDetails] = useState<MovieRecommendationDetails[]>([]);
  const [userDescription, setUserDescription] = useState<string>("");

  return (
    <div>
      <div>
        Say a fews words about yourself:
        <Input onChange={
          (e) => {
            setUserDescription(e.target.value);
          }
        }>
        </Input>
      </div>
      <button onClick={async () => {
        setMoviesLoaded(false);
        setMovies([]);
        setMovieRecommendationDetails([]);
        const movies = await MovieService.recommendMoviesBasedOnDescription(userDescription);
        console.log(movies)
        setMovies(movies);
        setMoviesLoaded(true);

        const result = await MovieService.getPronsAndConsForBooks(movies);
        setMovieRecommendationDetails(result);
      }}>Get movie recommendations</button>
      {moviesLoaded ? 
      <div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <b>The recommended movies are:</b>
        {movies.map((x) => <div>{`${x.title} ${x.releaseDate}`}</div>)}
      </div>
      <b>
        Let's see what people say about them:
        </b>
      </div>
      :
      <div></div>
      }

      <div style={{ display: "flex", flexDirection: "column" }}>
        {movieRecommendationDetails.map((x) =>
          <div>
            <h2>{`${x.title}`}</h2>
            <h4>Positives</h4>
            <div>{`${x.advantages}`}</div>
            <h4>Negatives</h4>
            <div>{`${x.disadvantages}`}</div>
          </div>
        )}
      </div>
    </div>
  );

}
