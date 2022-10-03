import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { BackendError } from '../../common/error';

declare module 'axios' {
  interface AxiosResponse<T> extends Promise<T> {}
}

export abstract class HttpClient {
  protected readonly apiKey: string;
  protected readonly projectId: string;
  protected readonly instance: AxiosInstance;
  protected readonly protectedInstance: AxiosInstance;
  protected readonly identityServiceInstance: AxiosInstance;

  public constructor(baseURL: string, identityBaseURL: string, apiKey: string, projectId: string) {
    this.instance = axios.create({
      baseURL,
    });
    this.protectedInstance = axios.create({
      baseURL,
      headers: {
        'X-API-KEY': apiKey,
      },
    });
    this.identityServiceInstance = axios.create({
      baseURL: identityBaseURL
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

  protected _handleError = (error: Error) => {
    if (error instanceof AxiosError) {
      const code: string = error.response?.data?.error_code;
      const message: string = error.response?.data?.message;
      if (code !== undefined && message !== undefined) {
        return Promise.reject(new BackendError(code, message));
      }
    }
    return Promise.reject(error);
  };
}
