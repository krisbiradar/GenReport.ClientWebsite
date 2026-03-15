import axios, { AxiosError, AxiosInstance, HttpStatusCode } from "axios";
import { HttpResponse } from "../models/shared/http-response";

import { getJwt } from "../helpers/window-helpers";
import { showPopup } from "../helpers/popup-helper";
import { HttpErrorResponse } from "../models/shared/http-error-response";
import { injectable } from "inversify";
import Constants from "../static/constants";

@injectable()
class ApiClient {
  instance: AxiosInstance | undefined;
  constructor() {
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_BASE_URL || import.meta.env.BASE_URL || "", // Replace with your base URL
      timeout: Number.parseInt((import.meta.env.VITE_REQUEST_TIMEOUT || import.meta.env.REQUEST_TIMEOUT) as string || "5000"), // Set a default timeout (in milliseconds)
      headers: {
        'Content-Type': 'application/json'
      },

    });
    // this is to handle the 401 error returned by the server 
    this.instance?.interceptors.request.use(this.addJwtToHeaders);
    this.instance?.interceptors.response.use(
      response => response, // On success, just return the response
      error => {
        if (error.response?.status === HttpStatusCode.Forbidden) {
          showPopup({
            title: "Access Denied",
            body: "You do not have permission to access or modify this resource.",
            type: "error",
            onClose: () => {
              window.history.back();
            }
          });
        }
        return error.response;
      }
    );
  }

  async sendHttpGet<T extends object>(
    endPoint: string,
    queryString?: URLSearchParams
  ): Promise<HttpResponse<T>> {
    try {
      const response = await this.instance?.get<HttpResponse<T>>(
        `${endPoint}?${queryString?.toString() || ''}`
      );
      return (
        response?.data ||
        new HttpResponse(
          new HttpErrorResponse(
            HttpStatusCode.NotImplemented,
            "NO RESPONSE FROM SERVER CHECK SERVER LOGS",
            "NO_RESPONSE",
            []
          )
        )
      );
    } catch (ex: any) {
      if (axios.isAxiosError(ex)) {
        const axiosError = ex as AxiosError;
        console.error("AXIOS ERROR", ex);
        if (axiosError.status == HttpStatusCode.BadRequest) {
          return new HttpResponse(
            new HttpErrorResponse(
              HttpStatusCode.BadRequest,
              "Invalid request",
              "INVALID_REQUEST",
              [JSON.stringify(axiosError.response?.data)]
            )
          );
        }
      }
      const error = ex as Error;
      console.warn("UNHANDLED ERROR");
      console.error("ERROR IN GET REQUEST", error.message);
      console.error("STACKTRACE :", error.stack);
      return new HttpResponse(
        new HttpErrorResponse(HttpStatusCode.InternalServerError, "", "", [])
      );
    }
  }
  async sendHttpPost<T>(
    req: any,
    endPoint: string,
    queryParams?: URLSearchParams
  ) {
    try {
      const response = await this.instance?.post<T>(
        `${endPoint}?${queryParams?.toString() || ''}`,
        req
      );
      return (
        response?.data ||
        new HttpResponse(
          new HttpErrorResponse(
            HttpStatusCode.NotImplemented,
            "NO RESPONSE FROM SERVER CHECK SERVER LOGS",
            "NO_RESPONSE",
            []
          )
        )
      );
    } catch (ex: any) {
      if (axios.isAxiosError(ex)) {
        const axiosError = ex as AxiosError;
        console.error("AXIOS ERROR", ex);
        if (axiosError.status == HttpStatusCode.BadRequest) {
          return new HttpResponse(
            new HttpErrorResponse(
              HttpStatusCode.BadRequest,
              "Invalid request",
              "INVALID_REQUEST",
              [JSON.stringify(axiosError.response?.data)]
            )
          );
        }
      }
      const error = ex as Error;
      console.warn("UNHANDLED ERROR");
      console.error("ERROR IN POST REQUEST", error.message);
      console.error("STACKTRACE :", error.stack);
      return new HttpResponse(
        new HttpErrorResponse(HttpStatusCode.InternalServerError, "", "", [])
      );
    }
  }
  async addJwtToHeaders(config: any): Promise<any> {
    if (Constants.excludeJwtValidation.some((e, i, a) => (config.url as string).startsWith(e))) {
      return config;
    }
    const jwtToken = await getJwt();
    if (jwtToken) {
      config.headers["Authorization"] = `Bearer ${jwtToken}`;
    }
    return config;
  }
  async sendHttpPut<T>(
    endPoint: string,
    req: any,
    queryParams?: URLSearchParams,

  ) {
    try {
      const response = await this.instance?.put<T>(
        `${endPoint}?${queryParams?.toString()}`,
        req
      );
      return (
        response?.data ||
        new HttpResponse(
          new HttpErrorResponse(
            HttpStatusCode.NotImplemented,
            "NO RESPONSE FROM SERVER CHECK SERVER LOGS",
            "NO_RESPONSE",
            []
          )
        )
      );
    } catch (ex: any) {
      if (axios.isAxiosError(ex)) {
        const axiosError = ex as AxiosError;
        console.error("AXIOS ERROR", ex);
        if (axiosError.status == HttpStatusCode.BadRequest) {
          return new HttpResponse(
            new HttpErrorResponse(
              HttpStatusCode.BadRequest,
              "Invalid request",
              "INVALID_REQUEST",
              [JSON.stringify(axiosError.response?.data)]
            )
          );
        }
      }
      const error = ex as Error;
      console.warn("UNHANDLED ERROR");
      console.error("ERROR IN PUT REQUEST", error.message);
      console.error("STACKTRACE :", error.stack);
      return new HttpResponse(
        new HttpErrorResponse(HttpStatusCode.InternalServerError, "", "", [])
      );
    }
  }
}

export default ApiClient;
