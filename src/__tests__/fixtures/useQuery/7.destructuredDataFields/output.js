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
        month {
          aNestedField {
            evenMoreNested
          }
        }
        day
      }
    }
  }
`;

function Movie() {
  const {
    data: { id, name, actor, year },
  } = useQuery(_MOVIE__GETMOVIEQUERY);
  const { day } = year;
  const {
    month: { aNestedField },
  } = year;
  const actorName = actor.name;
  return (
    <div>
      <div>
        <p>{id}</p>
        <p>{name}</p>
        <p>{day}</p>
        <p>{month}</p>
        <p>{aNestedField.evenMoreNested}</p>
        <p>{actor.name}</p>
        <p>{actorName}</p>
        <p>{actor._birthDate}</p>
      </div>
    </div>
  );
}
