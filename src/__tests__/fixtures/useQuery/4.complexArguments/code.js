function Movie() {
  const { data } = useQuery("GetMovie");

  return (
    <div>
      <div>
        <p>{data.id}</p>
        <p>{data.name}</p>
        <p>{data.year}</p>
        <p>{data.director.id}</p>
        <p>{data.director.name({ firstOnly: true }, "@preload")}</p>
        <p>{data.director.age("@cache", { format: "number" }).formatted}</p>
        <p>{data.director.company.id}</p>
        <p>{data.director.company.name}</p>
      </div>
    </div>
  );
}
