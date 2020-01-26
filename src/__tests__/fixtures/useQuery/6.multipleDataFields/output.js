const _MOVIE__GETMOVIEQUERY = gql`
  query Movie__GetMovieQuery {
    GetMovie {
      id
      name
      actor {
        name
        _birthDate: birthDate @preload
      }
      year {
        id
      }
    }
  }
`;

function Movie() {
  const {
    data: { id, name, actor, year },
  } = useQuery(_MOVIE__GETMOVIEQUERY);
  return (
    <div>
      <div>
        <p>{id}</p>
        <p>{name}</p>
        <p>{year.id}</p>
        <p>{actor.name}</p>
        <p>{actor._birthDate}</p>
      </div>
    </div>
  );
}
