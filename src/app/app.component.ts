import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginService } from './services/login.service';
import { SharedUiComponent } from './ui-header/ui-header.component';

@Component({
    standalone: true,
    imports: [RouterOutlet, SharedUiComponent],
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
