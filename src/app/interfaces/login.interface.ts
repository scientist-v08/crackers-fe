export interface LoginRequestBody {
    email: string;
    password: string;
}

export interface LoginInterface {
    access_token: string;
    routes: LoginRouteInterface[];
}

export interface LoginRouteInterface {
    id: number;
    route: string;
    heading: string;
    role: string;
}
