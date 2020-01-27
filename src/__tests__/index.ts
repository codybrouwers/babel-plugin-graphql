import path from "path";
import pluginTester from "babel-plugin-tester";
import plugin from "..";

describe("tests pass", () => {
  pluginTester({
    plugin,
    fixtures: path.join(__dirname, "./fixtures"),
    tests: [
      {
        code: `
          function Movie() {
            const { data: { actor } } = useQuery("GetMovie");

            return (
              <div>
                <div>
                  <p>{actor.name}</p>
                </div>
              </div>
            );
          }
      `,
        output: `
          const _MOVIE__GETMOVIEQUERY = gql\`
            query Movie__GetMovieQuery {
              GetMovie {
                actor {
                  name
                }
              }
            }
          \`;

          function Movie() {
            const {
              data: { actor },
            } = useQuery(_MOVIE__GETMOVIEQUERY);
            return (
              <div>
                <div>
                  <p>{actor.name}</p>
                </div>
              </div>
            );
          }
        `,
      },
      // {
      //   code: `
      //       function Movie() {
      //         const { data } = useQuery("GetMovie");
      //         const { more } = data.releaseDate;
      //         return (
      //           <div>
      //             <div>
      //               <p>{more.id}</p>
      //               <p>{more.thing.banana}</p>
      //             </div>
      //           </div>
      //         );
      //       }
      //   `,
      //   output: `
      //     const _MOVIE__GETMOVIEQUERY = gql\`
      //       query Movie__GetMovieQuery {
      //         GetMovie {
      //           releaseDate {
      //             more
      //           }
      //         }
      //       }
      //     \`;

      //     function Movie() {
      //       const { data } = useQuery(_MOVIE__GETMOVIEQUERY);
      //       const { more } = data.releaseDate;
      //       return (
      //         <div>
      //           <div>
      //             <p>{more}</p>
      //           </div>
      //         </div>
      //       );
      //     }
      // `,
      // },
      // {
      //   code: `
      //     function Movie() {
      //       const {
      //         data: { id, name, actor, year },
      //       } = useQuery("GetMovie");

      //       const { day } = year;
      //       const {
      //         month: { aNestedField },
      //       } = year;

      //       return (
      //         <div>
      //           <div>
      //             <p>{id}</p>
      //             <p>{name}</p>
      //             <p>{day}</p>
      //             <p>{month}</p>
      //             <p>{aNestedField.evenMoreNested}</p>
      //             <p>{actor.name}</p>
      //             <p>{actor.birthDate("@preload")}</p>
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
      //           name
      //           actor {
      //             name
      //             _birthDate: birthDate @preload
      //           }
      //           year {
      //             day
      //             month {
      //               aNestedField {
      //                 evenMoreNested
      //               }
      //             }
      //           }
      //         }
      //       }
      //     \`;

      //     function Movie() {
      //       const {
      //         data: { id, name, actor, year },
      //       } = useQuery(_MOVIE__GETMOVIEQUERY);
      //       const { day } = year;
      //       const {
      //         month: { aNestedField },
      //       } = year;
      //       return (
      //         <div>
      //           <div>
      //             <p>{id}</p>
      //             <p>{name}</p>
      //             <p>{day}</p>
      //             <p>{month}</p>
      //             <p>{aNestedField.evenMoreNested}</p>
      //             <p>{actor.name}</p>
      //             <p>{actor._birthDate}</p>
      //           </div>
      //         </div>
      //       );
      //     }
      // `,
      // },
    ],
  });
});
