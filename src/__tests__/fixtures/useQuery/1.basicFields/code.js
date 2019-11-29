function Movie() {
  const { data } = useQuery("GetMovie");

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
