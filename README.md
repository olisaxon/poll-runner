# REST Runner

A small utility for running poll requests using a CSV input file.

The runner automatically replaces path parameters in the endpoint URL using values from the CSV file.

---

# Installation

Install deps:

```bash
npm install
```
---

# CSV Data File

The CSV file must contain headers matching the path parameters.

Example `sample.csv`:

```csv
submissionId
123
456
789
```

Each row will produce one request.

---

# Basic Usage

```ts

const rr = RestRunner.Init({
  endpoint: "poll", // only works with poll for now
  filePath,
  // executes after successful fetch
  onSuccess: ({ pathParams }) => {
    console.log(pathParams.submissionId); // path params available in hooks
    console.log("req completed");
  },
  // executed in the catch block with the error
  onError: ({ error }) => {
    console.error(error);
  },
});

rr.run().then(console.log).catch(console.error);
```

---

# Environment

The `[ENV]` placeholder inside a route will be replaced.

```ts
RestRunner.Init({
  endpoint: "poll",
  filePath,
  env: "PROD", // defaults to QA,
  delayMs: 500 // defaults to 0
});
```