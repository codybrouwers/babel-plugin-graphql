## Query

```jsx
import { useQuery } from "blade/apollo.macro";

function Movie() {
  const { loading, error, data } = useQuery("Movie");
  const { Movie } = data;

  return (
    <div>
      <h2>{Movie.name}</h2>
    </div>
  );
}
```

      ↓ ↓ ↓ ↓ ↓ ↓

```jsx
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";

const MOVIE_QUERY = gql`
  query MovieQuery {
    Movie {
      id
      name
    }
  }
`;

function Movie() {
  const { loading, error, data } = useQuery(MOVIE_QUERY);
  const { Movie } = data;
  return (
    <div>
      <h2>{Movie.name}</h2>
    </div>
  );
}
```

### Fragments

```jsx
import { useFragment } from "blade/apollo.macro";

function MovieName() {
  const { name } = useFragment("Movie");
  return (
    <div>
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
    id # For cacheing, optional
    name
  }
`;

function MovieName({ name }) {
  return (
    <div>
      <div>
        <h2>{name}</h2>
      </div>
    </div>
  );
}
```
