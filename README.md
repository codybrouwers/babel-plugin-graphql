## Query

```jsx
import { useQuery } from "blade/apollo.macro";

function MovieComponent() {
  const { loading, error, data } = useQuery("GetMovie");

  return (
    <div>
      <h2>{data.id}</h2>
      <h2>{data.name}</h2>
      <h2>{data.releaseDate({ formatted: true })}</h2>
      <h2>{data.director.name}</h2>
    </div>
  );
}
```

      ↓ ↓ ↓ ↓ ↓ ↓

```jsx
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";

const _MOVIE_COMPONENT_GETMOVIE_QUERY = gql`
  query MovieQuery($releaseDateFormatted: Boolean) {
    GetMovie {
      id
      name
      releaseDate(formatted: $releaseDateFormatted)
      director {
        name
      }
    }
  }
`;

function MovieComponent() {
  const { loading, error, data } = useQuery(_MOVIE_COMPONENT_GETMOVIE_QUERY, {
    variables: {
      releaseDateFormatted: true,
    },
  });

  return (
    <div>
      <h2>{data.id}</h2>
      <h2>{data.name}</h2>
      <h2>{data.releaseDate}</h2>
      <h2>{data.director.name}</h2>
    </div>
  );
}
```

### Fragments

```jsx
import { useFragment } from "blade/apollo.macro";

function MovieName() {
  const { id, name } = useFragment("Movie");
  return (
    <div>
      <h2>{id}</h2>
      <h2>{name}</h2>
    </div>
  );
}
```

      ↓ ↓ ↓ ↓ ↓ ↓

```jsx
import gql from "graphql-tag";

MovieName.fragment = gql`
  fragment MovieNameFragment on Movie {
    id
    name
  }
`;

function MovieName({ id, name }) {
  return (
    <div>
      <div>
        <h2>{id}</h2>
        <h2>{name}</h2>
      </div>
    </div>
  );
}
```

## Query with a fragment

```jsx
import { useQuery } from "blade/apollo.macro";

function MovieComponent() {
  const { loading, error, data } = useQuery("GetMovie");

  return (
    <div>
      <h2>{data.id}</h2>
      <h2>{data.director.name}</h2>
      <MovieName />
    </div>
  );
}
```

      ↓ ↓ ↓ ↓ ↓ ↓

```jsx
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";

const _MOVIE_COMPONENT_GETMOVIE_QUERY = gql`
  query MovieQuery($releaseDateFormatted: Boolean) {
    GetMovie {
      id
      director {
        name
      }
      ...MovieNameFragment
    }
  }
  ${MovieName.fragment}
`;

function MovieComponent() {
  const { loading, error, data } = useQuery(_MOVIE_COMPONENT_GETMOVIE_QUERY);

  return (
    <div>
      <h2>{data.id}</h2>
      <h2>{data.director.name}</h2>
      <MovieName id={data.id} name={data.name} />
    </div>
  );
}
```

## Mutations

```jsx
import { useMutation } from "blade/apollo.macro";

function EditMovieComponent() {
  const [mutation, { loading, error, data }] = useMutation("EditMovie");

  return (
    <div>
      <h2>{data.name}</h2>
      <button onClick={() => mutation({ variables: { name: "NewName" } })} />
    </div>
  );
}
```

      ↓ ↓ ↓ ↓ ↓ ↓

```jsx
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";

const EDIT_MOVIE_COMPONENT_EDIT_MOVIE_MUTATION = gql`
  mutation EditMovieMutation($name: String!) {
    EditMovie(name: $name) {
      id
      name
    }
  }
`;

function EditMovieComponent() {
  const [mutation, { loading, error, data }] = useMutation(
    EDIT_MOVIE_COMPONENT_EDIT_MOVIE_MUTATION
  );

  return (
    <div>
      <h2>{data.name}</h2>
      <button onClick={() => mutation({ variables: { name: "NewName" } })} />
    </div>
  );
}
```

```

```
