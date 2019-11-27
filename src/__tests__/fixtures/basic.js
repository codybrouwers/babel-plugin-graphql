function Movie() {
  const { data } = useQuery("GetMovie");

  return (
    <div>
      <div>
        <p>{data.aaa.bbb.ccc.ddd}</p>
      </div>
    </div>
  );
}

// <p>{data.id}</p>
// <p>{data.director.id}</p>
// <p>{data.nodd.banana}</p>
// <h2>{data.name}</h2>
// <h2>{data.id}</h2>
// <p>{data.releaseDate.formatted}</p>
