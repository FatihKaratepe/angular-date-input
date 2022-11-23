import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject, takeUntil } from 'rxjs';
import * as moment from 'moment';

export interface DateInputError {
  name?: string;
  message?: string;
}

@Component({
  selector: 'app-date-input',
  templateUrl: './date-input.component.html',
  styleUrls: ['./date-input.component.scss']
})

export class DateInputComponent implements OnInit, OnDestroy {
  @Input() name?: string;
  @Input() control!: FormControl;
  @Input() readOnly?: boolean = false;
  @Input() minDate?: string | FormControl | Observable<string>;
  @Input() maxDate?: string | FormControl | Observable<string>;
  @Input() minDateErrorContent?: string;
  @Input() maxDateErrorContent?: string;
  @Input() isDateOfBirth?: boolean;

  pasteError?: boolean = false;
  errorArray?: DateInputError[] = [];
  minDateVal?: string;
  maxDateVal?: string;
  unsubscribe$ = new Subject<void>();

  dateForm = new FormGroup({
    day: new FormControl('', [Validators.required]),
    month: new FormControl('', [Validators.required]),
    year: new FormControl('', [Validators.required]),
  })


  get day() { return this.dateForm.get('day') as FormControl }
  get month() { return this.dateForm.get('month') as FormControl }
  get year() { return this.dateForm.get('year') as FormControl }

  constructor() { }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    if (this.minDate) {
      if (this.minDate instanceof FormControl) {
        this.minDateVal = this.minDate.value;
      } else if (this.minDate instanceof Observable) {
        this.minDate.pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
          this.minDateVal = data;
        })
      } else {
        this.minDateVal = this.minDate;
      };
    };

    if (this.maxDate) {
      if (this.maxDate instanceof FormControl) {
        this.maxDateVal = this.maxDate.value;
      } else if (this.maxDate instanceof Observable) {
        this.maxDate.pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
          this.maxDateVal = data;
        })
      } else {
        this.maxDateVal = this.maxDate;
      };
    };

    this.dateForm.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe(formValues => {

      if (formValues.day === '00') {
        if (!this.findSameError('invalidDay')) {
          this.errorArray?.push({
            name: 'invalidDay',
            message: 'Please enter a valid day',
          });
        };
      } else {
        if (this.findSameError('invalidDay')) {
          const errorIndex = this.errorArray?.map(e => e.name).indexOf('invalidDay');
          this.errorArray?.splice(errorIndex!, 1);
        }
      }
      if (formValues.month === '00') {
        if (!this.findSameError('invalidMonth')) {
          this.errorArray?.push({
            name: 'invalidMonth',
            message: 'Please enter a valid month',
          });
        };
      } else {
        if (this.findSameError('invalidMonth')) {
          const errorIndex = this.errorArray?.map(e => e.name).indexOf('invalidMonth');
          this.errorArray?.splice(errorIndex!, 1);
        }
      }

      const dateOfBirthControl = this.isDateOfBirth ? formValues.year?.startsWith('0') : formValues.year?.startsWith('0') || formValues.year?.startsWith('1');

      if (dateOfBirthControl) {
        if (!this.findSameError('invalidYear')) {
          this.errorArray?.push({
            name: 'invalidYear',
            message: 'Please enter a valid year',
          });
        };
      } else {
        if (this.findSameError('invalidYear')) {
          const errorIndex = this.errorArray?.map(e => e.name).indexOf('invalidYear');
          this.errorArray?.splice(errorIndex!, 1);
        }
      }

      if ((formValues.day?.length === 2 && formValues.month?.length === 2 && formValues.year?.length === 4) && (formValues.day !== '00' && formValues.month !== '00' && !(dateOfBirthControl))) {
        this.setDateValue();
        if (this.minDateVal || this.maxDateVal) {
          if (this.minDateVal) this.minDateControl();
          if (this.maxDateVal) this.maxDateControl();
        }
      } else {
        this.control.patchValue('');
        this.control.markAsTouched();
        this.control.markAsDirty();
      }
    })
  }


  minDateControl() {
    if (moment(this.control.value, 'MM-DD-YYYY').isBefore(this.minDateVal)) {
      if (!this.findSameError('minDateError')) {
        this.errorArray?.push({
          name: 'minDateError',
          message: this.minDateErrorContent,
        });
      };
      this.control.patchValue('');
    } else {
      if (this.findSameError('minDateError')) {
        const errorIndex = this.errorArray?.map(e => e.name).indexOf('minDateError');
        this.errorArray?.splice(errorIndex!, 1);
      }
    }
  }

  maxDateControl() {
    if (moment(this.control.value, 'MM-DD-YYYY').isAfter(this.maxDateVal)) {
      if (!this.findSameError('maxDateError')) {
        this.errorArray?.push({
          name: 'maxDateError',
          message: this.maxDateErrorContent,
        });
      };
      this.control.patchValue('');
    } else {
      if (this.findSameError('maxDateError')) {
        const errorIndex = this.errorArray?.map(e => e.name).indexOf('maxDateError');
        this.errorArray?.splice(errorIndex!, 1);
      }
    }
  }

  setDateValue(): void {
    const formValues = this.dateForm.getRawValue();
    this.control.patchValue(formValues.month + '-' + formValues.day + '-' + formValues.year);
  }

  disablePaste(event: any) {
    if (!this.pasteError) this.pasteError = true;
    event.preventDefault();
  }

  findSameError(errorName: string): boolean {
    let sameError = this.errorArray?.find(error => error.name === errorName);
    if (sameError) return true;
    return false;
  }

  goNextOrPreviusInput(event: any, maxLength: number) {
    let nextInput = event.srcElement.nextElementSibling;
    let prevInput = event.srcElement.previousElementSibling;
    if (event.code === 'Backspace') {
      if (event.target.value.length === 0 && prevInput) {
        prevInput.focus();
      }
    } else if (event.code === 'Tab') {
      this.control.markAsTouched();
      this.control.markAsDirty();
    } else {
      if (event.target.value.length === maxLength && nextInput) {
        nextInput.focus();
      }
    }
  }

  blockNumbersForDay(event: any) {
    if (this.month.value === '02') {
      if (event.target.value.length === 0 && event.key === '3') {
        event.preventDefault()
      }
    }
  }

}
