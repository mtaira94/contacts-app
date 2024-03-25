import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ContactsService } from '../contacts/contacts.service';
import { Subscription, debounce, debounceTime, distinctUntilChanged } from 'rxjs';
import { Contact, addressTypeValues, phoneTypeValues } from '../contacts/contact.model';
import { restrictedWords } from '../validators/restricted-words-validator';
import { ProfileIconSelectorComponent } from '../profile-icon-selector/profile-icon-selector.component';

@Component({
  templateUrl: './edit-contact.component.html',
  styleUrls: ['./edit-contact.component.css']
})
export class EditContactComponent implements OnInit, OnDestroy {
  contactSub!: Subscription;
  contactSaveSub!: Subscription;
  phoneTypes = phoneTypeValues;
  addressTypes = addressTypeValues;

  contactForm = this.fb.nonNullable.group({
    id: '',
    icon: '',
    personal: false,
    firstName: ['', [Validators.required, Validators.minLength(3)]],
    lastName: '',
    dateOfBirth: <Date | null>null,
    favoritesRanking: <number | null>null,
    phones: this.fb.array([this.createPhoneGroupt()]),
    address: this.fb.nonNullable.group({
      streetAddress: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', Validators.required],
      addressType: ['', Validators.required],
    }),
    notes: ['', restrictedWords(['foo', 'bar'])]
  });

  constructor(
    private route: ActivatedRoute,
    private contacstService: ContactsService,
    private router: Router,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    const contactId = this.route.snapshot.params['id'];
    if (!contactId) {
      this.subscribeToAddressChanges();
      return
    }

    this.contactSub = this.contacstService.getContact(contactId).subscribe(contact => {
      if (!contact) return

      for (let i = 1; i < contact.phones.length; i++) {
        this.addPhone();
      }

      this.contactForm.setValue(contact);

      this.subscribeToAddressChanges();
    });
  }

  ngOnDestroy(): void {
    // this.contactSub.unsubscribe();
    // this.contactSaveSub.unsubscribe();
  }

  addPhone() {
    this.contactForm.controls.phones.push(this.createPhoneGroupt());
  }

  stringifyCompare(a: any, b: any): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  createPhoneGroupt() {
    const phoneGroup = this.fb.nonNullable.group({
      phoneNumber: '',
      phoneType: '',
      preferred: false
    });

    phoneGroup.controls.preferred.valueChanges
      .pipe(
        distinctUntilChanged(this.stringifyCompare)
      )
      .subscribe(value => {
        if (value) {
          phoneGroup.controls.phoneNumber.addValidators([Validators.required])
        } else {
          phoneGroup.controls.phoneNumber.removeValidators([Validators.required])
        }

        phoneGroup.controls.phoneNumber.updateValueAndValidity();
      });

    return phoneGroup;
  }

  get firstName() {
    return this.contactForm.controls.firstName;
  }

  get notes() {
    return this.contactForm.controls.notes;
  }

  subscribeToAddressChanges() {
    const addressGroup = this.contactForm.controls.address;

    addressGroup.valueChanges
      .pipe(
        distinctUntilChanged(this.stringifyCompare)
      )
      .subscribe(() => {
        for (const controlName in addressGroup.controls) {
          addressGroup.get(controlName)?.removeValidators([Validators.required]);
          addressGroup.get(controlName)?.updateValueAndValidity();
        }
      });

    addressGroup.valueChanges
      .pipe(
        debounceTime(2000),
        distinctUntilChanged(this.stringifyCompare)
      )
      .subscribe(() => {
        for (const controlName in addressGroup.controls) {
          addressGroup.get(controlName)?.addValidators([Validators.required]);
          addressGroup.get(controlName)?.updateValueAndValidity();
        }
      });
  }

  saveContact() {
    console.log(this.contactForm.value);

    this.contactSaveSub = this.contacstService.saveContact(this.contactForm.getRawValue()).subscribe({
      next: () => this.router.navigate(['/contacts'])
    })
  }
}
