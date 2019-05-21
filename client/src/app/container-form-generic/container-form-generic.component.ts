import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContainerRestService } from '../container-rest.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-container-form-generic',
  templateUrl: './container-form-generic.component.html',
  styleUrls: ['./container-form-generic.component.css'],
  providers: [ContainerRestService]
})
export class ContainerFormGenericComponent implements OnInit {

  myForm: FormGroup;

  constructor(private containerRestService: ContainerRestService, fb: FormBuilder, private router: Router) {
    this.myForm = fb.group({
      txtName: ["", Validators.required],
      txtImage: ["hello-world", Validators.required],
      txtCmdContainer: ["",]
    })
  }

  ngOnInit() {
  }

}
