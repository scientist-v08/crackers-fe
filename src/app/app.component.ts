import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginService } from './services/login.service';
import { HeaderComponent } from './header/header.component';

@Component({
    standalone: true,
    imports: [RouterOutlet, HeaderComponent],
    selector: 'app-root',
    templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
    loginService = inject(LoginService);
    title = 'Vinayaka Crackers';
    routes = this.loginService.allRoutes;

    ngOnInit(): void {
        if (this.routes().length === 0) {
            const storedRoutes = localStorage.getItem('routes');
            if (storedRoutes) {
                this.loginService.allRoutes.set(JSON.parse(storedRoutes));
            }
        }
    }
}
