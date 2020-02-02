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
      //       return (
      //         <div>
      //           <div>
      //             {data.id("@preload")}
      //             {data.id("@different")}
      //           </div>
      //         </div>
      //       );
      //     }
      // `,
      //   output: `
      //     const _MOVIE__GETMOVIEQUERY = gql\`
      //       query Movie__GetMovieQuery {
      //         GetMovie {
      //           id @preload
      //           _id: id @different
      //         }
      //       }
      //     \`;
      //     function Movie() {
      //       const { data } = useQuery(_MOVIE__GETMOVIEQUERY);
      //       return (
      //         <div>
      //           <div>
      //             {data.id}
      //             {data._id}
      //           </div>
      //         </div>
      //       );
      //     }
      //   `,
      // },
    ],
  });
});
