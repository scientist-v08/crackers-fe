import { Component } from '@angular/core';

@Component({
    standalone: true,
    imports: [],
    selector: 'app-not-found',
    template: `
        <div class="page-shell">
            <div class="page-container page-stack">
                <div class="content-card py-16 text-center">
                    <h1 class="page-title">Page Not Found</h1>
                    <p class="page-subtitle mt-4 max-w-lg mx-auto">
                        This page does not exist or you do not have access to it.
                    </p>
                </div>
            </div>
        </div>
    `,
})
export default class NotFoundComponent {}