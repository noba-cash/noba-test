import axios, { AxiosInstance } from "axios";
import { decrypt } from "@/shared/encryp";
import { UserAuth } from "@/contexts/type/userAuth";

export class HttpService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    });
  }

  private async getToken<T>(): Promise<string | undefined> {
    const storageUser = sessionStorage.getItem("bk-user");
    // @ts-ignore
    const user = JSON.parse(decrypt(storageUser)) as UserAuth;

    if (!user.token || !storageUser) {
      return undefined;
    }

    return user.token;
  }

  private async getHeader(isFormData: boolean = false) {
    let token = await this.getToken();

    if (!token) {
      // await router.push("/");
      return;
    }
    const type = isFormData ? "multipart/form-data" : "application/json";
    return {
      headers: {
        "Content-Type": type,
        Authorization: "Bearer " + token,
      },
    };
  }

  public async post<T>(
    url: string,
    form: any,
    isPrivate: boolean = true,
    isFormData: boolean = false
  ): Promise<T> {
    let headerRequest: any;

    if (isPrivate) {
      headerRequest = await this.getHeader(isFormData);
    } else {
      headerRequest = {
        headers: {
          "Content-Type": "application/json",
          Authorization: "",
        },
      };
    }

    const response = await this.client.post(url, form, headerRequest);

    return response.data.data ?? ("" as T);
  }

  public async patch<T>(
    url: string,
    form: any,
    isPrivate: boolean = true,
    isFormData: boolean = false
  ): Promise<T> {
    let headerRequest: any;
    if (isPrivate) {
      headerRequest = await this.getHeader(isFormData);
    } else {
      headerRequest = {};
    }

    const response = await this.client.patch(url, form, headerRequest);

    return response.data ?? ("" as T);
  }

  public async get<T>(url: string, payload = [], isPrivate = true): Promise<T> {
    let data: any;
    let header: any;
    if (isPrivate) {
      header = await this.getHeader();
    } else {
      header = {
        headers: {
          "Content-Type": "application/json",
        },
      };
    }

    if (payload.length > 0) {
      const params = new URLSearchParams(payload).toString();
      url = `${url}?${params}`;
    }

    data = await this.client.get(url, header);

    return data.data;
  }
}

export const httpService = new HttpService();
