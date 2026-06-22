export interface LoginRequestBody {
    Email: string;
    Password: string;
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
