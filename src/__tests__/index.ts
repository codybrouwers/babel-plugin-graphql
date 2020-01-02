import path from "path";
import pluginTester from "babel-plugin-tester";
import plugin from "..";

pluginTester({
  plugin,
  fixtures: path.join(__dirname, "./fixtures"),
  tests: [
    // {
    //   code: `
    //     function Movie() {
    //       const { data } = useQuery("GetMovie");
    //       const {
    //         name,
    //         actor,
    //         director: { company },
    //       } = data;
    //       return (
    //         <div>
    //           <div>
    //             <p>{data.id}</p>
    //             <p>{name}</p>
    //             <p>{actor.name}</p>
    //             <p>{director.id}</p>
    //             <p>{data.director.name({ firstOnly: true }, "@preload")}</p>
    //             <p>{data.director.age("@cache", { format: "number" })}</p>
    //             <p>{company.id}</p>
    //             <p>{company.name}</p>
    //           </div>
    //         </div>
    //       );
    //     }
    //   `,
    //   output: `
    //     const _MOVIE__GETMOVIEQUERY = gql\`
    //       query Movie__GetMovieQuery {
    //         GetMovie {
    //           id
    //           name
    //           year
    //           actor {
    //             name
    //           }
    //           director {
    //             id
    //             name(firstOnly: true) @preload
    //             age(format: "number") @cache
    //             company {
    //               id
    //               name
    //             }
    //           }
    //         }
    //       }
    //     \`;
    //     function Movie() {
    //       const { data } = useQuery(_MOVIE__GETMOVIEQUERY);
    //       return (
    //         <div>
    //           <div>
    //             <p>{data.id}</p>
    //             <p>{data.name}</p>
    //             <p>{data.year}</p>
    //             <p>{data.director.id}</p>
    //             <p>
    //               {data.director.name(
    //                 {
    //                   firstOnly: true,
    //                 },
    //                 "@preload"
    //               )}
    //             </p>
    //             <p>
    //               {data.director.age("@cache", {
    //                 format: "number",
    //               })}
    //             </p>
    //             <p>{data.director.company.id}</p>
    //             <p>{data.director.company.name}</p>
    //           </div>
    //         </div>
    //       );
    //     }
    //   `,
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
