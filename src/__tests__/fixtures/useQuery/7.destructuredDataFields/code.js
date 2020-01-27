function Movie() {
  const {
    data: { id, name, actor, year },
  } = useQuery("GetMovie");

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
        <p>{actor.birthDate("@preload")}</p>
      </div>
    </div>
  );
}
