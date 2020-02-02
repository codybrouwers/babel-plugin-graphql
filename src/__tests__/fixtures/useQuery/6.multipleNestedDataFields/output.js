const _MOVIE__GETMOVIEQUERY = gql`
  query Movie__GetMovieQuery {
    GetMovie {
      id
      name
      actor {
        name
        birthDate @preload
      }
      year {
        date {
          day
        }
      }
    }
  }
`;

function Movie() {
  const {
    data: {
      id,
      name,
      actor,
      year: {
        date: { day },
      },
    },
  } = useQuery(_MOVIE__GETMOVIEQUERY);
  return (
    <div>
      <div>
        <p>{id}</p>
        <p>{name}</p>
        <p>{day}</p>
        <p>{actor.name}</p>
        <p>{actor.birthDate}</p>
      </div>
    </div>
  );
}
