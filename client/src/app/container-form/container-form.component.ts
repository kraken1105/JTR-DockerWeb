import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContainerRestService } from '../container-rest.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-container-form',
  templateUrl: './container-form.component.html',
  styleUrls: ['./container-form.component.css'],
  providers: [ContainerRestService]
})
export class ContainerFormComponent implements OnInit {

  myForm: FormGroup;
  hideDictUpload: boolean = false;
  filePswUnshadowed: File;
  fileDictionary: File;
  

  /**
   * Costruttore, inietto il servizio che fornisce le API REST
   */
  constructor(private containerRestService: ContainerRestService, fb: FormBuilder, private router: Router) {
    this.myForm = fb.group({
      txtName: ["", Validators.required],
      selectMod: ["wordlist", Validators.required],
      fileDictionary: ["", ],
      filePswUnshadowed: ["", Validators.required],
      otherParams: ["--format=sha512crypt ", ]
    })
  }

  ngOnInit() {
  }

  postContainer() {
    let formData = new FormData();
    // appendo i dati relativi al container
    formData.append("Name", this.myForm.controls["txtName"].value);
    formData.append("selectMod", this.myForm.controls["selectMod"].value);
    formData.append("otherParams", this.myForm.controls["otherParams"].value);
    
    // appendo il file delle password
    formData.append("filePswUnshadowed", this.filePswUnshadowed, this.filePswUnshadowed.name);
    // appendo il file del dizionario se la modalità è wordlist e se esso è stato fornito
    if(this.myForm.controls["selectMod"].value=="wordlist" && this.myForm.controls["fileDictionary"].dirty)
      formData.append("fileDictionary", this.fileDictionary, this.fileDictionary.name);

    this.containerRestService.postContainer(this.myForm.controls["txtName"].value, formData)
      .subscribe((result) => {
        console.log("POST "+this.myForm.controls["txtName"].value+" "+result);
        alert(result);
        this.router.navigateByUrl('/');
      },
      (error) => {
        console.log("POST "+this.myForm.controls["txtName"].value+" "+error.error);
        alert(error.error);
      });
  }

  // utilità
  fileChange(element, index:number) {
    if(index==0) this.filePswUnshadowed = element.target.files[0];
    else this.fileDictionary = element.target.files[0];
  }
  updateForm() {
    if(this.myForm.controls["selectMod"].value==="wordlist")
      this.hideDictUpload=false;
    else this.hideDictUpload=true;
  }
}
