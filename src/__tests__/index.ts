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
      //       const {
      //         data: { id, year },
      //       } = useQuery("GetMovie");
      //       const { day } = year;
      //       return (
      //         <div>
      //           <div>
      //             <p>{id}</p>
      //             <p>{day}</p>
      //           </div>
      //         </div>
      //       );
      //     }
      // `,
      //   output: `
      //     const _MOVIE__GETMOVIEQUERY = gql\`
      //       query Movie__GetMovieQuery {
      //         GetMovie {
      //           id
      //           year {
      //             day
      //           }
      //         }
      //       }
      //     \`;
      //     function Movie() {
      //       const {
      //         data: { id, year },
      //       } = useQuery(_MOVIE__GETMOVIEQUERY);
      //       const { day } = year;
      //       return (
      //         <div>
      //           <div>
      //             <p>{id}</p>
      //             <p>{day}</p>
      //           </div>
      //         </div>
      //       );
      //     }
      // `,
      // },
    ],
  });
});
