import qs from "qs";

export enum ContentType {
  json = "application/json;charset=UTF-8",
  form = "application/x-www-form-urlencoded;charset=UTF-8",
}

export enum HttpMethod {
  get = "GET",
  post = "POST",
  put = "PUT",
  patch = "PATCH",
  delete = "DELETE",
}

export interface IHeader {
  "Content-Type"?: string;
  "X-Requested-With"?: string;
  token?: string;
  [propName: string]: any;
}

export interface IReqConfig {
  body?: any;
  method?: string;
  headers?: IHeader;
  token?: string;
  "Content-Type"?: string;
}

export const baseUrl = "/";

const request = async (url: string, config?: IReqConfig) => {
  let response: Response;
  let contentType: string;

  if (config!["Content-Type"] !== undefined) {
    contentType = config!["Content-Type"];
  } else if (config!.method === HttpMethod.post) {
    contentType = ContentType.form;
  } else {
    contentType = ContentType.json;
  }

  const headers: Headers = new Headers({
    token: config!.token === undefined ? sessionStorage.token : config!.token,
    "Content-Type": contentType,
  } as IHeader);

  if (!config!.method || config!.method === HttpMethod.get) {
    response = await fetch(url, {
      headers,
    });
  } else if (config!.method === HttpMethod.post) {
    response = await fetch(url, {
      body: qs.stringify(config!.body),
      headers,
      method: HttpMethod.post,
    });
  } else {
    response = await fetch(url, {
      body: qs.stringify(config!.body),
      headers,
      method: config!.method,
    });
  }

  return handleRes(response);
};

const handleRes = async (res: Response) => {
  const parsedRes = await parseRes(res);

  if (res.ok) {
    return parsedRes;
  }

  const error = parsedRes;
  throw error;
};

const parseRes = async (res: Response) => {
  const contentType = res.headers.get("Content-Type");
  if (contentType) {
    if (contentType.indexOf("json") > -1) {
      return await res.json();
    }
    if (contentType.indexOf("text") > -1) {
      return await res.text();
    }
    if (contentType.indexOf("form") > -1) {
      return await res.formData();
    }
    if (contentType.indexOf("video") > -1) {
      return await res.blob();
    }
  }
  return await res.text();
};

export default request;
