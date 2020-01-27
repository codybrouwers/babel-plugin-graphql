import path from "path";
import pluginTester from "babel-plugin-tester";
import plugin from "..";

describe("tests pass", () => {
  pluginTester({
    plugin,
    // fixtures: path.join(__dirname, "./fixtures"),
    tests: [
      {
        code: `
          function Movie() {
            const { data } = useQuery("GetMovie");
            const release = data.releaseDate;
            return (
              <div>
                <div>
                  <p>{data.id}</p>
                  <p>{release.more}</p>
                </div>
              </div>
            );
          }
      `,
        output: `
          const _MOVIE__GETMOVIEQUERY = gql\`
            query Movie__GetMovieQuery {
              GetMovie {
                releaseDate {
                  more
                }
                id
              }
            }
          \`;

          function Movie() {
            const { data } = useQuery(_MOVIE__GETMOVIEQUERY);
            const release = data.releaseDate;
            return (
              <div>
                <div>
                  <p>{data.id}</p>
                  <p>{release.more}</p>
                </div>
              </div>
            );
          }
      `,
      },
    ],
  });
});
