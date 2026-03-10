import { RestRunner } from "./runner.ts";

const filePath = "sample.csv";

const rr = RestRunner.Init({
  url: "https://lender-communications.qa.zuto.cloud/api/Submissions/:submissionId/poll",
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
