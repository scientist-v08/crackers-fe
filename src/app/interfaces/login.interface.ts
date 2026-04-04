export interface LoginRequestBody {
  Email: string;
  Password: string;
}

export interface LoginInterface {
  access_token: string;
  routes: LoginRouteInterface[];
}

export interface LoginRouteInterface {
  Id: number;
  Route: string;
  Heading: string;
  Role: string;
}
