import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import myconfig from "../../../../myconfig.json";
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
  myConfig = myconfig;
  currentSelectedImage = myconfig.images[0];
  existClientPresentForImage: boolean = true;
  showTxtImageCustom: boolean = false;
  filesToUpload: File[] = [];
  numFileToUpload: number = 0;

  constructor(private containerRestService: ContainerRestService, fb: FormBuilder, private router: Router) {
    this.myForm = fb.group({
      txtName: ["", Validators.required],
      selImage: ["jtr", Validators.required],
      txtImageCustom: ["busybox",],
      selCmdPreset: ["custom", Validators.required],
      txtCmd: ["",],
      txtPathMountIn: ["/in",],
      fileToAdd: ["",]
    });
   }

  ngOnInit() {
  }

  postContainer() {
    let formData = new FormData();
    // appendo i dati relativi al container
    formData.append("txtName", this.myForm.controls["txtName"].value);
    formData.append("selImage", this.myForm.controls["selImage"].value);
    formData.append("txtImageCustom", this.myForm.controls["txtImageCustom"].value);
    formData.append("selCmdPreset", this.myForm.controls["selCmdPreset"].value);
    formData.append("txtCmd", this.myForm.controls["txtCmd"].value);
    formData.append("txtPathMountIn", this.myForm.controls["txtPathMountIn"].value);
    formData.append("numfileToUpload", this.numFileToUpload.toString());
    
    // appendo i file
    var i: number = 0;
    for (let i=0; i<this.numFileToUpload; i++)
      formData.append(i.toString(), this.filesToUpload[i], this.filesToUpload[i]["name"]);

    // invio la post al backend
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

  onSelImageChange() {
    this.currentSelectedImage = myconfig.images.find(image => image.name===this.myForm.controls.selImage.value);
    this.myForm.controls.txtCmd.setValue("");

    if(this.currentSelectedImage.name=='custom') {
      this.showTxtImageCustom = true;
      this.myForm.controls.txtImageCustom.setValidators([Validators.required]);
      this.existClientPresentForImage=false;
      this.myForm.controls.selCmdPreset.clearValidators();
    } else {
      this.showTxtImageCustom = false;
      this.myForm.controls.txtImageCustom.clearValidators();
    }

    if("client-preset" in this.currentSelectedImage) {
      this.existClientPresentForImage=true;
      this.myForm.controls.selCmdPreset.setValidators([Validators.required]);
      this.myForm.controls.txtPathMountIn.setValue(this.currentSelectedImage["client-preset"]["mount-in-container"]);
    } else {
      this.existClientPresentForImage=false;
      this.myForm.controls.selCmdPreset.clearValidators();
      this.myForm.controls.txtPathMountIn.setValue("");
    }
  }

  onCmdPresetChange() {
    this.myForm.controls.txtCmd.setValue("");
    if("client-preset" in this.currentSelectedImage) {
      let presets: Array<Object> = this.currentSelectedImage["client-preset"]["cmd-presets"];
      this.myForm.controls.txtCmd.setValue(presets.find(cp => cp["name"]===this.myForm.controls.selCmdPreset.value)["cmd"]);
    }
  }

  fileChange(element) {
    this.filesToUpload[this.numFileToUpload] = element.target.files[0];
    this.numFileToUpload++;
  }

  resetContainer() {
    this.filesToUpload = [];
    this.numFileToUpload = 0;
  }

}
