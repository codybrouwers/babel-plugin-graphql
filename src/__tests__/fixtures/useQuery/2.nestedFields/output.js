const MOVIE_QUERY = gql`
  query MovieQuery {
    GetMovie {
      id
      name
      year
      director {
        id
        name
        age
        company {
          id
          name
        }
      }
    }
  }
`;

function Movie() {
  const { data } = useQuery("GetMovie");
  return (
    <div>
      <div>
        <p>{data.id}</p>
        <p>{data.name}</p>
        <p>{data.year}</p>
        <p>{data.director.id}</p>
        <p>{data.director.name}</p>
        <p>{data.director.age}</p>
        <p>{data.director.company.id}</p>
        <p>{data.director.company.name}</p>
      </div>
    </div>
  );
}
