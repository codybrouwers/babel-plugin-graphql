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
      //   function Movie() {
      //     const { data } = useQuery("GetMovie");
      //     return (
      //       <div>
      //         <div>
      //           <p>{data.more.name({ firstOnly: true }, "@preload").another}</p>
      //         </div>
      //       </div>
      //     );
      //   }
      // `,
      //   output: `
      //   const _MOVIE__GETMOVIEQUERY = gql\`
      //     query Movie__GetMovieQuery {
      //       GetMovie {
      //         more {
      //           name(firstOnly: true) @preload {
      //             another
      //           }
      //         }
      //       }
      //     }
      //   \`;
      //   function Movie() {
      //     const { data } = useQuery(_MOVIE__GETMOVIEQUERY);
      //     return (
      //       <div>
      //         <div>
      //           <p>{data.more.name.another}</p>
      //         </div>
      //       </div>
      //     );
      //   }
      // `,
      // },
      // {
      //   code: `
      //     function Movie() {
      //       const { data: { company } } = useQuery("GetMovie");
      //       return (
      //         <div>
      //           <p>{company.birthdate("@preload")}</p>
      //         </div>
      //       );
      //     }
      //   `,
      //   output: `
      //     const _MOVIE__GETMOVIEQUERY = gql\`
      //       query Movie__GetMovieQuery {
      //         GetMovie {
      //           company {
      //             birthdate @preload
      //           }
      //         }
      //       }
      //     \`;
      //     function Movie() {
      //       const {
      //         data: { company },
      //       } = useQuery(_MOVIE__GETMOVIEQUERY);
      //       return (
      //         <div>
      //           <p>{company.birthdate("@preload")}</p>
      //         </div>
      //       );
      //     }
      //   `,
      // },
    ],
  });
});
