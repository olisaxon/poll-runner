import * as csv from "@fast-csv/parse";
import { readFile } from "node:fs/promises";
import type { PathParams, PathsWithParams } from "./types.ts";
import { setTimeout } from "node:timers/promises";
import { pathMap } from "./pathMap.ts";

export type RunnerScript<T extends PathsWithParams> = ({ pathParams }: { pathParams: PathParams<T> }) => void;
export type RunnerScriptWithError<T extends PathsWithParams> = ({ pathParams, error }: { pathParams: PathParams<T>, error: unknown }) => void;
export const env = ["QA", "PROD"] as const
type Env = typeof env[number]

export type RunnerOptions<T extends PathsWithParams> = {
  endpoint: keyof typeof pathMap;
  env?: Env;
  filePath: string;
  delayMs?: number;
  onBefore?: RunnerScript<T>;
  onSuccess?: RunnerScript<T>;
  onError?: RunnerScriptWithError<T>;
};

export class RestRunner<T extends PathsWithParams> {
  private readonly endpoint: keyof typeof pathMap;
  private readonly filePath: string;
  private env: Env;
  private delayMs: number;
  private promise?: Promise<PathParams<T>[]>;
  private pathParams!: PathParams<T>;
  private pathParamValues: PathParams<T>[] = [];
  private isLoaded: boolean = false;
  private onBefore?: RunnerScript<T>;
  private onSuccess?: RunnerScript<T>;
  private onError?: RunnerScriptWithError<T>;

  constructor(options: RunnerOptions<T>) {
    this.endpoint = options.endpoint;
    this.env = options.env as Env;
    this.filePath = options.filePath;
    this.onBefore = options.onBefore;
    this.onSuccess = options.onSuccess;
    this.onError = options.onError;
    this.delayMs = options.delayMs ?? 0;
  }

  async run() {
    console.log("running")
    if (!this.isLoaded && this.promise) {
      this.pathParamValues = await this.promise;
      this.isLoaded = true;
    }

    const output = {
      completed: 0,
    };

    for (const param of this.pathParamValues) {
      this.pathParams = param;
      const url = this.buildUrlWithParams(param);
      console.log(url)

      if (this.onBefore) {
        this.onBefore({ pathParams: this.pathParams });
      }

      try {
        await fetch(url);

        if (this.onSuccess) {
          this.onSuccess({ pathParams: this.pathParams });
        }
        output.completed++;

      } catch (error) {
        if (this.onError) {
          this.onError({ pathParams: this.pathParams, error })
        }
      } finally {
        if (this.delayMs > 0) {
          await setTimeout(this.delayMs)
        }
      }
    }

    return output;
  }

  private async loadData() {
    const buffer = await readFile(this.filePath, "utf-8");

    return new Promise<PathParams<T>[]>((resolve, reject) => {
      const data: PathParams<T>[] = [];
      const stream = csv
        .parse({ headers: true })
        .on("data", (row: PathParams<T>) => data.push(row))
        .on("end", () => resolve(data))
        .on("error", reject);

      stream.write(buffer);
      stream.end();
    });
  }

  static Init<U extends PathsWithParams>(options: RunnerOptions<U>) {
    const runner = new RestRunner(options);

    runner.promise = runner.loadData();

    return runner;
  }

  private buildUrlWithParams(params: PathParams<T>, env?: Env): string {
    
    let route: string = pathMap[this.endpoint];

    let _env: Env = env ?? "QA";
    for (const key in params) {
      const value = params[key as keyof PathParams<T>] as string;
      route = route.replace(`:${key}`, value);
      route = route.replace("[ENV]", _env.toLowerCase());
    }
    return route;
  }
}
