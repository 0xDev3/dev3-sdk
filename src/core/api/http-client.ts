import axios, { AxiosInstance, AxiosResponse } from 'axios';

declare module 'axios' {
  interface AxiosResponse<T> extends Promise<T> {}
}

export abstract class HttpClient {
  protected readonly apiKey: string;
  protected readonly projectId: string;
  protected readonly instance: AxiosInstance;
  protected readonly protectedInstance: AxiosInstance;

  public constructor(baseURL: string, apiKey: string, projectId: string) {
    this.instance = axios.create({
      baseURL,
    });
    this.protectedInstance = axios.create({
      baseURL,
      headers: {
        'X-API-KEY': apiKey,
      },
    });
    this.projectId = projectId;
    this.apiKey = apiKey;
    this._initializeResponseInterceptor();
  }

  private _initializeResponseInterceptor = () => {
    this.instance.interceptors.response.use(
      this._handleResponse,
      this._handleError
    );
    this.protectedInstance.interceptors.response.use(
      this._handleResponse,
      this._handleError
    );
  };

  private _handleResponse = ({ data }: AxiosResponse) => data;

  protected _handleError = (error: Error) => Promise.reject(error);
}
