### TODO

# Arguments

- [x] Remove arguments and directives after adding to graphql AST
- [] Create alias for each field that has an argument so that you can use the same field with different arguments multiple times

# Field parsing

- [] Handle nested destructuring of data property:
  ```js
  const {
    data: {
      director: { name },
    },
  } = useQuery();
  ```
- [] Handle nested destructuring outside of data property:
  ```js
  const { data } = useQuery();
  const {
    director: { name },
  } = data;
  ```

# Arrays

- [] Handle array functions like `.map`, `.forEeach`, `.reduce`
- [] Look into tracking fields within array functions

# Fragments

- [] Setup `useFragment`
- [] For every `useQuery`, look at child components and add their fragments to the query.

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

const MOVIE_COMPONENT_GETMOVIE_QUERY = gql`
  query MovieQuery($releaseDate_formatted: Boolean) {
    GetMovie {
      id
      name
      releaseDate(formatted: $releaseDate_formatted)
      director {
        name
      }
    }
  }
`;

function MovieComponent() {
  const { loading, error, data } = useQuery(MOVIE_COMPONENT_GETMOVIE_QUERY, {
    variables: {
      releaseDate_formatted: true,
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

const MOVIE_COMPONENT_GETMOVIE_QUERY = gql`
  query MovieQuery {
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
  const { loading, error, data } = useQuery(MOVIE_COMPONENT_GETMOVIE_QUERY);

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

function MovieForm() {
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

const MOVIE_FORM_EDIT_MOVIE_MUTATION = gql`
  mutation EditMovieMutation($name: String!) {
    EditMovie(name: $name) {
      id
      name
    }
  }
`;

function MovieForm() {
  const [mutation, { loading, error, data }] = useMutation(MOVIE_FORM_EDIT_MOVIE_MUTATION);

  return (
    <div>
      <h2>{data.name}</h2>
      <button onClick={() => mutation({ variables: { name: "NewName" } })} />
    </div>
  );
}
```
