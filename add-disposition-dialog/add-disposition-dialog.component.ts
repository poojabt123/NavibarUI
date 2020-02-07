import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-add-disposition-dialog',
  templateUrl: './add-disposition-dialog.component.html',
  styleUrls: ['./add-disposition-dialog.component.sass']
})
export class AddDispositionDialogComponent implements OnInit {

  topic = "";
  constructor(public dialogRef: MatDialogRef<AddDispositionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public confirmMessage: string) { }
  
  ngOnInit() {
    //this.message = this.confirmMessage
    //console.log(this.message)
  }
  onNoClick(): void {
    this.dialogRef.close(false);
  }
  onSave():void{
    this.dialogRef.close(this.topic);
  }

}
