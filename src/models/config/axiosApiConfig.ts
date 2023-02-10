export interface AxiosApiConfig {
  readonly endpoint: string;
  readonly key?: string;
  readonly pathPrefix?: string;
  readonly timeout: number;
  readonly headers?: { [key: string]: string };
  readonly params?: { [key: string]: string };
}
