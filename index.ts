import { RestRunner } from "./runner.ts";

const filePath = "sample.csv";

const rr = RestRunner.Init({
  url: "https://jsonplaceholder.typicode.com/posts/:postId",
  filePath,
  onSuccess: ({ routeParams }) => {
    console.log(routeParams.postId)
    console.log("req completed")
  },
  onError: ({ error }) => {
    console.error(error)
  }
});

rr.run().then(console.log).catch(console.error);
