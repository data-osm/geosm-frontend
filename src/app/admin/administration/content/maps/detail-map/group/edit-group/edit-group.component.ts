import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, ValidationErrors, ValidatorFn, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { EMPTY, ReplaySubject, Subject } from 'rxjs';
import { EditMapComponent } from '../../../edit-map/edit-map.component';
import {MapsService} from '../../../../../service/maps.service'
import {IconService} from '../../../../../service/icon.service'
import { Group } from '../../../../../../../type/type';
import { takeUntil, switchMap, catchError, tap } from 'rxjs/operators';

@Component({
  selector: 'app-edit-group',
  templateUrl: './edit-group.component.html',
  styleUrls: ['./edit-group.component.scss']
})
export class EditGroupComponent implements OnInit {

  onUpdateInstance: ()=>void
  
  public colorList = [
    { key: 'red', value: '#FF3A33' },
    { key: 'terracotta', value: '#E68673' },
    { key: 'orange', value: '#FF7733' },
    { key: 'amber', value: '#FFAA00' },
    { key: 'khaki', value: '#B3A17D' },
    { key: 'yellow', value: '#FFD11A' },
    { key: 'lime', value: '#BCD92B' },
    { key: 'grass', value: '#7ACC29' },
    { key: 'green', value: '#00CC66' },
    { key: 'moviikgreen', value: '#17E68F' },
    { key: 'jade', value: '#4D997D' },
    { key: 'teal', value: '#73DFE6' },
    { key: 'skyblue', value: '#4DC3FF' },
    { key: 'blue', value: '#0095FF' },
    { key: 'royalblue', value: '#0055FF' },
    { key: 'ultraviolet', value: '#6200EE' },
    { key: 'violet', value: '#8126FF' },
    { key: 'deeppurple', value: '#AA33FF' },
    { key: 'pink', value: '#FF99CC' },
    { key: 'strawberry', value: '#FD5B82' }
  ];
  public presetValues: string[] = [];

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  

  form: FormGroup = this.formBuilder.group({})
  private readonly notifier: NotifierService;
  
  constructor(
    public dialogRef: MatDialogRef<EditMapComponent>,
    private formBuilder: FormBuilder,
    notifierService: NotifierService,
    public MapsService:MapsService,
    public IconService:IconService,
    @Inject(MAT_DIALOG_DATA) public group: Group,
  ) { 
    this.notifier = notifierService;
    this.presetValues = this.getColorValues();
    
    this.form.addControl('name',new FormControl(this.group.name, [Validators.required]))
    this.form.addControl('color',new FormControl(this.group.color, [Validators.required]))
    this.form.addControl('icon_id',new FormControl(this.group.icon.icon_id))
    this.form.addControl('svg_as_text',new FormControl(null))
    this.form.addControl('icon_path',new FormControl(null))
    
    this.form.addControl('type_group',new FormControl(this.group.type_group, [Validators.required]))
    // this.form.addControl('map_id',new FormControl(this.group.map_id, [Validators.required]))
    this.form.addControl('group_id',new FormControl(this.group.group_id, [Validators.required]))

    this.form.setValidators(atLeastOne(Validators.required, ['icon_path','svg_as_text']))

    const onUpdate:Subject<void> = new Subject<void>()
    this.onUpdateInstance = ()=>{
      onUpdate.next()
    }
    onUpdate.pipe(
      takeUntil(this.destroyed$),
      switchMap(()=>{
        return this.MapsService.updateGroup(this.form.value).pipe(
          catchError(() => { this.notifier.notify("error", "An error occured while updating group"); return EMPTY }),
          tap(_=>{this.dialogRef.close(true);})
        )
      })
    ).subscribe()
  }

  ngOnInit(): void {
  }

  ngOnDestroy():void{
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  close(): void {
    this.dialogRef.close(false);
  }

  getColorValues() {
    return this.colorList.map(c => c.value);
  }

  onColorPickerSelect(color:string, field:string) {
    this.form.get(field).setValue(color);
  }

}
export const atLeastOne = (validator: ValidatorFn, controls:string[] = null) => (
  group: FormGroup,
): ValidationErrors | null => {
  if(!controls){
    controls = Object.keys(group.controls)
  }

  const hasAtLeastOne = group && group.controls && controls
    .some(k => !validator(group.controls[k]));

  return hasAtLeastOne ? null : {
    atLeastOne: true,
  };
};
