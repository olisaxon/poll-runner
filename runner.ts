import * as csv from "@fast-csv/parse";
import { readFile } from "node:fs/promises";
import { RouteParams } from "./types.ts";
import { RoutesWithParams } from "./types.ts";
import { setTimeout } from "node:timers/promises";

export type RunnerScript<T extends RoutesWithParams> = ({ routeParams }: { routeParams: RouteParams<T> }) => void;
export type RunnerScriptWithError<T extends RoutesWithParams> = ({ routeParams, error }: { routeParams: RouteParams<T>, error: unknown }) => void;

export type RunnerOptions<T extends RoutesWithParams> = {
  url: T;
  filePath: string;
  delayMs?: number;
  onBefore?: RunnerScript<T>;
  onSuccess?: RunnerScript<T>;
  onError?: RunnerScriptWithError<T>;
};

export class RestRunner<T extends RoutesWithParams> {
  private readonly url: T;
  private readonly filePath: string;
  private delayMs: number;
  private promise?: Promise<RouteParams<T>[]>;
  private routeParams!: RouteParams<T>;
  private parameterValues: RouteParams<T>[] = [];
  private isLoaded: boolean = false;
  private onBefore?: RunnerScript<T>;
  private onSuccess?: RunnerScript<T>;
  private onError?: RunnerScriptWithError<T>;

  constructor(options: RunnerOptions<T>) {
    this.url = options.url;
    this.filePath = options.filePath;
    this.onBefore = options.onBefore;
    this.onSuccess = options.onSuccess;
    this.onError = options.onError;
    this.delayMs = options.delayMs ?? 0;
  }

  async run() {
    if (!this.isLoaded && this.promise) {
      this.parameterValues = await this.promise;
      this.isLoaded = true;
    }

    const output = {
      completed: 0,
    };

    for (const param of this.parameterValues) {
      this.routeParams = param;
      const url = this.buildUrlWithParams(param);

      if (this.onBefore) {
        this.onBefore({ routeParams: this.routeParams });
      }

      try {
        await fetch(url);

        if (this.onSuccess) {
          this.onSuccess({ routeParams: this.routeParams });
        }
        output.completed++;

      } catch (error) {
        if (this.onError) {
          this.onError({ routeParams: this.routeParams, error })
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

    return new Promise<RouteParams<T>[]>((resolve, reject) => {
      const data: RouteParams<T>[] = [];
      const stream = csv
        .parse({ headers: true })
        .on("data", (row: RouteParams<T>) => data.push(row))
        .on("end", () => resolve(data))
        .on("error", reject);

      stream.write(buffer);
      stream.end();
    });
  }

  static Init<U extends RoutesWithParams>(options: RunnerOptions<U>) {
    const runner = new RestRunner(options);

    runner.promise = runner.loadData();

    return runner;
  }

  private buildUrlWithParams(params: RouteParams<T>): string {
    let route: string = this.url;
    for (const key in params) {
      const value = params[key as keyof RouteParams<T>] as string;
      route = route.replace(`:${key}`, value);
    }
    return route;
  }
}
