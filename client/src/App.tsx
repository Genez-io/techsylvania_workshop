import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Button,
  Col,
  Container,
  FormGroup,
  Input,
  Label,
  Row,
} from "reactstrap";
import {
  MovieRecommendationDetails,
  Movie,
  MovieService,
} from "@genezio-sdk/movie-guru_us-east-1";
import "./App.css";

function App() {
  const [loading, setLoading] = useState<boolean>(false);
  const [moviesLoaded, setMoviesLoaded] = useState<boolean>(false);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [movieRecommendationDetails, setMovieRecommendationDetails] = useState<
    MovieRecommendationDetails[]
  >([]);
  const [userDescription, setUserDescription] = useState<string>("");

  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col md={8}>
          <h3>Movie Recommendation System</h3>
          <FormGroup>
            <Label>Say a fews words about yourself:</Label>
            <Input
              onChange={(e) => {
                setUserDescription(e.target.value);
              }}
            ></Input>
          </FormGroup>
          <Button
            color="primary"
            onClick={async () => {
              setMoviesLoaded(false);
              setMovies([]);
              setMovieRecommendationDetails([]);
              setLoading(true);
              const movies =
                await MovieService.recommendMoviesBasedOnDescription(
                  userDescription
                );
              setLoading(false);

              if (movies.length === 0) {
                alert(
                  "An error has occured! Contact our system administrator!"
                );
                return;
              }

              setMovies(movies);
              setMoviesLoaded(true);

              const result = await MovieService.getProsAndConsForMovies(movies);
              setMovieRecommendationDetails(result);
            }}
          >
            Get movie recommendations
          </Button>
          {loading ? <div>Loading...</div> : <div></div>}
          {moviesLoaded ? (
            <div>
              <div
                style={{ display: "flex", flexDirection: "column" }}
                className="mt-3"
              >
                <b>The recommended movies are:</b>
                {movies.map((x) => (
                  <div>{`${x.title} ${x.releaseDate}`}</div>
                ))}
              </div>
              <div className="mt-3">
                <b>Let's see what people say about them:</b>
              </div>
              {movieRecommendationDetails.length === 0 ? (
                <div>Loading...</div>
              ) : (
                <div></div>
              )}
            </div>
          ) : (
            <div></div>
          )}

          <div style={{ display: "flex", flexDirection: "column" }}>
            {movieRecommendationDetails.map((x) => (
              <div className="mt-3">
                <h3>{`${x.title}`}</h3>
                <h4>Positives</h4>
                <div>{`${x.advantages}`}</div>
                <h4>Negatives</h4>
                <div>{`${x.disadvantages}`}</div>
              </div>
            ))}
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
