import path from "path";
import pluginTester from "babel-plugin-tester";
import plugin from "..";

pluginTester({
  plugin,
  fixtures: path.join(__dirname, "./fixtures"),
  tests: [
    {
      code: `
        function Movie() {
          const { data } = useQuery("GetMovie");
          return (
            <div>
              <p>{data.Movie.releaseDate}</p>
              <p>{data.Movie.director.id}</p>
              <p>{data.Movie.director.name({first: 5})}</p>
              <p>{data.Movie.director.name}</p>
            </div>
          );
        }
      `,
      output: `
        const _MOVIE__GETMOVIEQUERY = gql\`
          query Movie__GetMovieQuery {
            GetMovie {
              Movie {
                releaseDate
                director {
                  id
                  name(first: 5)
                }
              }
            }
          }
        \`;

        function Movie() {
          const { data } = useQuery(_MOVIE__GETMOVIEQUERY);
          return (
            <div>
              <p>{data.Movie.releaseDate}</p>
              <p>{data.Movie.director.id}</p>
              <p>
                {data.Movie.director.name({
                  first: 5,
                })}
              </p>
              <p>{data.Movie.director.name}</p>
            </div>
          );
        }
      `,
    },
    {
      code: `
        function Movie() {
          const { data } = useQuery("GetMovie");
          return (
            <div>
              <p>{data.Movie.releaseDate({numberArg: 123, stringArg: "abc"}, "@preload")}</p>
            </div>
          );
        }
      `,
      output: `
        const _MOVIE__GETMOVIEQUERY = gql\`
          query Movie__GetMovieQuery {
            GetMovie {
              Movie {
                releaseDate(numberArg: 123, stringArg: "abc") @preload
              }
            }
          }
        \`;

        function Movie() {
          const { data } = useQuery(_MOVIE__GETMOVIEQUERY);
          return (
            <div>
              <p>
                {data.Movie.releaseDate(
                  {
                    numberArg: 123,
                    stringArg: "abc",
                  },
                  "@preload"
                )}
              </p>
            </div>
          );
        }
      `,
    },
  ],
});
