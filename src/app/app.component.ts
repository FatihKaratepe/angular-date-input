import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit{

  maxDateSub = new BehaviorSubject<string>('');

  testForm = new FormGroup({
    name: new FormControl('', Validators.required),
    date: new FormControl('', Validators.required),
    dateMax: new FormControl('', Validators.required),
  })

  get name() { return this.testForm.get('name') }
  get date() { return this.testForm.get('date') as FormControl }
  get dateMax() { return this.testForm.get('dateMax') as FormControl }

  ngOnInit(): void {
    this.maxDateSub.next('10-10-2022')
  }


}
