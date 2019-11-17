function Movie() {
  const result = useQuery("Movie");
  // const { loading, error, data } = result;
  // const { Movie } = data;

  return (
    <div>
      <div>
        <h2>{result.data.Movie.movie.gorilla}</h2>
        <p>{result.data.Movie.movie.monkey}</p>
        <p>{result.data.Movie.chimp}</p>
      </div>
    </div>
  );
}
