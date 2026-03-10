import { RestRunner } from "./runner.ts";

const filePath = "sample.csv";

const rr = RestRunner.Init({
  endpoint: "poll",
  filePath,
  onSuccess: ({ pathParams }) => {
    console.log(pathParams.submissionId)
    console.log("req completed")
  },
  onError: ({ error }) => {
    console.error(error)
  }
});

rr.run().then(console.log).catch(console.error);
