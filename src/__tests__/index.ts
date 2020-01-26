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
      //             <p>{data.name({ firstOnly: true }, "@preload")}</p>
      //             <p>{data.name({ firstOnly: false }).formatted}</p>
      //             <p>{data.name("@cache", { format: "number" }).formatted}</p>
      //           </div>
      //         </div>
      //       );
      //     }
      // `,
      //   output: `
      //     const _MOVIE__GETMOVIEQUERY = gql\`
      //       query Movie__GetMovieQuery {
      //         GetMovie {
      //           _name: name(firstOnly: true) @preload
      //           _name2: name(firstOnly: false) {
      //             formatted
      //           }
      //           _name3: name(format: "number") @cache {
      //             formatted
      //           }
      //         }
      //       }
      //     \`;
      //     function Movie() {
      //       const { data } = useQuery(_MOVIE__GETMOVIEQUERY);
      //       return (
      //         <div>
      //           <div>
      //             <p>{data._name}</p>
      //             <p>{data._name2.formatted}</p>
      //             <p>{data._name3.formatted}</p>
      //           </div>
      //         </div>
      //       );
      //     }
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
