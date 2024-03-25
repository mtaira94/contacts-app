import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ContactsService } from '../contacts/contacts.service';
import { Subscription } from 'rxjs';
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
    phone: this.fb.nonNullable.group({
      phoneNumber: '',
      phoneType: ''
    }),
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
    if (!contactId) return

    this.contactSub = this.contacstService.getContact(contactId).subscribe(contact => {
      if (!contact) return

      this.contactForm.setValue(contact);
    });
  }

  ngOnDestroy(): void {
    // this.contactSub.unsubscribe();
    // this.contactSaveSub.unsubscribe();
  }

  get firstName() {
    return this.contactForm.controls.firstName;
  }

  get notes() {
    return this.contactForm.controls.notes;
  }

  saveContact() {
    console.log(this.contactForm.value);

    this.contactSaveSub = this.contacstService.saveContact(this.contactForm.getRawValue()).subscribe({
      next: () => this.router.navigate(['/contacts'])
    })
  }
}
