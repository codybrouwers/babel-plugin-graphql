const _MOVIE__GETMOVIEQUERY = gql`
  query Movie__GetMovieQuery {
    GetMovie {
      id
      name
      year
      director {
        id
        name(firstOnly: true) @preload
        age(format: "number") @cache
        company {
          id
          name
        }
      }
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
        <p>{data.director.id}</p>
        <p>
          {data.director.name(
            {
              firstOnly: true,
            },
            "@preload"
          )}
        </p>
        <p>
          {data.director.age("@cache", {
            format: "number",
          })}
        </p>
        <p>{data.director.company.id}</p>
        <p>{data.director.company.name}</p>
      </div>
    </div>
  );
}
