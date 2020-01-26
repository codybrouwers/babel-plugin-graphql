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
  } = useQuery("GetMovie");

  return (
    <div>
      <div>
        <p>{id}</p>
        <p>{name}</p>
        <p>{day}</p>
        <p>{actor.name}</p>
        <p>{actor.birthDate("@preload")}</p>
      </div>
    </div>
  );
}
