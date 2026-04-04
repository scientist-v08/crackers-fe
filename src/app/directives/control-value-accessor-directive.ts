/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Directive, Inject, Injector, input, OnDestroy, OnInit, signal } from '@angular/core';
import {
    ControlValueAccessor,
    FormControl,
    FormControlDirective,
    FormControlName,
    FormGroupDirective,
    NgControl,
} from '@angular/forms';
import { distinctUntilChanged, startWith, Subject, takeUntil, tap } from 'rxjs';

@Directive({
    standalone: true,
    selector: '[appControlValueAccessor]',
})
export class ControlValueAccessorDirective<T> implements ControlValueAccessor, OnInit, OnDestroy {
    control: FormControl = new FormControl();

    private _isDisabled = signal<boolean>(false);
    isRequired = input<boolean>(false);
    private _destroy$ = new Subject<void>();
    private _onTouched!: () => T;

    constructor(@Inject(Injector) private injector: Injector) {}

    ngOnInit() {
        this.setFormControl();
    }

    setFormControl() {
        try {
            const formControl = this.injector.get(NgControl);

            switch (formControl.constructor) {
                case FormControlName:
                    this.control = this.injector
                        .get(FormGroupDirective)
                        .getControl(formControl as FormControlName);
                    break;
                default:
                    this.control = (formControl as FormControlDirective).form as FormControl;
                    break;
            }
        } catch (err) {
            this.control = new FormControl();
        }
    }

    writeValue(value: T): void {
        if (this.control) {
            // Prevent recursive calls by checking if the value has actually changed
            if (value !== this.control.value) {
                this.control.setValue(value, { emitEvent: false });
            }
        } else {
            this.control = new FormControl(value);
        }
    }

    registerOnChange(fn: (val: any) => T): void {
        this.control?.valueChanges
            .pipe(
                takeUntil(this._destroy$),
                startWith(this.control.value),
                distinctUntilChanged(),
                tap(val => {
                    if (val !== this.control.value) {
                        fn(val);
                    }
                }),
            )
            .subscribe(() => this.control?.markAsUntouched());
    }

    registerOnTouched(fn: () => T): void {
        this._onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        this._isDisabled.set(isDisabled);
    }

    ngOnDestroy() {
        this._destroy$.next();
        this._destroy$.complete();
    }
}
