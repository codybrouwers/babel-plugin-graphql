import path from "path";
import pluginTester from "babel-plugin-tester";
import plugin from "..";

describe("tests pass", () => {
  pluginTester({
    plugin,
    fixtures: path.join(__dirname, "./fixtures"),
    tests: [
      // {
      //   code: `
      //     function Movie() {
      //       const { data } = useQuery("GetMovie");
      //       const { day } = data.year;
      //       const theYear = data.year;
      //       return (
      //         <div>
      //           <div>
      //             <p>{data.id}</p>
      //             <p>{theYear}</p>
      //           </div>
      //         </div>
      //       );
      //     }
      // `,
      //   output: `
      //     const _MOVIE__GETMOVIEQUERY = gql\`
      //       query Movie__GetMovieQuery {
      //         GetMovie {
      //           year {
      //             month
      //           }
      //         }
      //       }
      //     \`;
      //     function Movie() {
      //       const { data } = useQuery(_MOVIE__GETMOVIEQUERY);
      //       const { month } = data.year;
      //       return (
      //         <div>
      //           <div>
      //             <p>{month}</p>
      //           </div>
      //         </div>
      //       );
      //     }
      // `,
      // },
    ],
  });
});
