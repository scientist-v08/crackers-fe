import { Component } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [],
  template: `
    <svg
      class="text-black dark:text-white"
      width="36"
      height="36"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="currentColor"
        d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z"
        class="spinner_aj0A"
      />
    </svg>
  `,
  styles: [
    `
      .spinner_aj0A {
        transform-origin: center;
        animation: spinner_KYSC 0.75s infinite linear;
      }
      @keyframes spinner_KYSC {
        100% {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class SpinnerComponent {}
