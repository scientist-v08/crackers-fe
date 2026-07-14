export interface LoginRequestBody {
    email: string;
    password: string;
}

export interface LoginInterface {
    access_token: string;
    routes: LoginRouteInterface[] | Route[];
}

export interface Route {
    id: number;
    route: string;
    heading: string;
    role: number;
}

export interface LoginRouteInterface {
    Id: number;
    Route: string;
    Heading: string;
    Role: string;
}
