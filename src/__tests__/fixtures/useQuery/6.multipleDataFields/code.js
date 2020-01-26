function Movie() {
  const {
    data: { id, name, actor, year },
  } = useQuery("GetMovie");

  return (
    <div>
      <div>
        <p>{id}</p>
        <p>{name}</p>
        <p>{year.id}</p>
        <p>{actor.name}</p>
        <p>{actor.birthDate("@preload")}</p>
      </div>
    </div>
  );
}
