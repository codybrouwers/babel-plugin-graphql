function Movie() {
  const { data } = useQuery("Movie");

  return (
    <div>
      <div>
        <h2>{data.Movie.name}</h2>
        <p>{data.Movie.releaseDate.formatted}</p>
        <p>{data.Movie.director.id}</p>
        <p>{data.Movie.director.name}</p>
      </div>
    </div>
  );
}
