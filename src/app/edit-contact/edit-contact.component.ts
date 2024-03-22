import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ContactsService } from '../contacts/contacts.service';
import { Subscription } from 'rxjs';
import { Contact } from '../contacts/contact.model';

@Component({
  templateUrl: './edit-contact.component.html',
  styleUrls: ['./edit-contact.component.css']
})
export class EditContactComponent implements OnInit, OnDestroy {
  contactSub!: Subscription;
  contactSaveSub!: Subscription;
  contactForm = this.fb.nonNullable.group({
    id: '',
    firstName: '',
    lastName: '',
    dateOfBirth: <Date | null>null,
    favoritesRanking: <number | null>null,
    phone: this.fb.nonNullable.group({
      phoneNumber: '',
      phoneType: ''
    }),
    address: this.fb.nonNullable.group({
      streetAddress: '',
      city: '',
      state: '',
      postalCode: '',
      addressType: '',
    })
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

  saveContact() {
    console.log(this.contactForm.value);

    this.contactSaveSub = this.contacstService.saveContact(this.contactForm.getRawValue()).subscribe({
      next: () => this.router.navigate(['/contacts'])
    })
  }
}
