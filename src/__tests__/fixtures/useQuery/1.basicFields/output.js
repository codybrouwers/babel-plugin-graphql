const _MOVIE__GETMOVIEQUERY = gql`
  query Movie__GetMovieQuery {
    GetMovie {
      id
      name
      year
    }
  }
`;

function Movie() {
  const { data } = useQuery(_MOVIE__GETMOVIEQUERY);
  return (
    <div>
      <div>
        <p>{data.id}</p>
        <p>{data.name}</p>
        <p>{data.year}</p>
      </div>
    </div>
  );
}
