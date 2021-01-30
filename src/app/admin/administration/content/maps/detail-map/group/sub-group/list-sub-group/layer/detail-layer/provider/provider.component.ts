import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { EMPTY, merge, Observable, ReplaySubject, Subject } from 'rxjs';
import { catchError, filter, switchMap } from 'rxjs/operators';
import { Layer, LayerProviders } from '../../../../../../../../../../../type/type';
import {MapsService} from '../../../../../../../../../service/maps.service'
import { AddLayerProviderComponent } from '../add-layer-provider/add-layer-provider.component';
import {manageCompHelper} from '../../../../../../../../../../../../helper/manage-comp.helper'
import { TranslateService } from '@ngx-translate/core';
import { EditLayerProviderComponent } from '../edit-layer-provider/edit-layer-provider.component';

@Component({
  selector: 'app-provider',
  templateUrl: './provider.component.html',
  styleUrls: ['./provider.component.scss']
})
export class ProviderComponent implements OnInit, OnChanges {
  onInitInstance:()=>void
  onAddInstance:()=>void
  onDeleteInstance:(LayerProviders)=>void
  onUpdateInstance:(LayerProviders)=>void

  @Input()layer:Layer
  
  providers:Observable<Array<LayerProviders>>
  displayedColumns:Array<string>=['provider','style', 'action']

  private readonly notifier: NotifierService;

  constructor(
    private formBuilder: FormBuilder,
    notifierService: NotifierService,
    public MapsService:MapsService,
    public dialog: MatDialog,
    public manageCompHelper:manageCompHelper,
    public translate: TranslateService,
  ) { 
    this.notifier = notifierService;

    const onInit:ReplaySubject<void> = new ReplaySubject<void>(1)
    this.onInitInstance = ()=>{
      onInit.next()
    }

    const onAdd:Subject<void> = new Subject<void>()
    this.onAddInstance = ()=>{
      onAdd.next()
    }

    const onDelete:Subject<LayerProviders> = new Subject<LayerProviders>()

    this.onDeleteInstance = (layerProviders:LayerProviders)=>{
      onDelete.next(layerProviders)
    }

    const onUpdate:Subject<LayerProviders> = new Subject<LayerProviders>()

    this.onUpdateInstance = (layerProviders:LayerProviders)=>{
      onUpdate.next(layerProviders)
    }

    this.providers = merge(
      onInit.pipe(
        filter(()=>this.layer != undefined),
        switchMap(()=>{
          return this.MapsService.getProviderWithStyleOfLayer(this.layer.layer_id).pipe(
            catchError(() => { this.notifier.notify("error", "An error occured while loading providers with style "); return EMPTY }),
          )
        })
      ),
      onAdd.pipe(
        switchMap(()=>{
          return this.dialog.open(AddLayerProviderComponent,{data:this.layer}).afterClosed().pipe(
            filter(response=>response),
            switchMap(()=>{
              return this.MapsService.getProviderWithStyleOfLayer(this.layer.layer_id).pipe(
                catchError(() => { this.notifier.notify("error", "An error occured while loading providers with style "); return EMPTY }),
              )
            })
          )
        })
      ),
      onUpdate.pipe(
        switchMap((layerProviders: LayerProviders)=>{
          return this.dialog.open(EditLayerProviderComponent,{data:layerProviders.vp_id, maxHeight:"90%",maxWidth:"90%",width:"80%",height:"80%"}).afterClosed().pipe(
            switchMap(()=>{
              return this.MapsService.getProviderWithStyleOfLayer(this.layer.layer_id).pipe(
                catchError(() => { this.notifier.notify("error", "An error occured while loading providers with style "); return EMPTY }),
              )
            })
          )
        })   
      ),
      onDelete.pipe(
        switchMap((layerProviders: LayerProviders) => {
          return this.manageCompHelper.openConfirmationDialog([],
            {
              confirmationTitle: this.translate.instant('list_provider_with_style.delete_title'),
              confirmationExplanation: this.translate.instant('admin.vector_provider.delete_confirmation_explanation') + layerProviders.vp.name + ' ?',
              cancelText: this.translate.instant('cancel'),
              confirmText: this.translate.instant('delete'),
            }
          ).pipe(
            filter(resultConfirmation => resultConfirmation),
            switchMap(()=>{
              return this.MapsService.deleteProviderWithStyleOfLayer(layerProviders.id).pipe(
                catchError(() => { this.notifier.notify("error", "An error occured while deleting a provider"); return EMPTY }),
                switchMap(()=>{
                  return this.MapsService.getProviderWithStyleOfLayer(this.layer.layer_id).pipe(
                    catchError(() => { this.notifier.notify("error", "An error occured while loading providers with style "); return EMPTY }),
                  )
                })
              )
            })
          )
        })
      )


    )
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.layer.currentValue){
      this.onInitInstance()
    }
  }

  ngOnInit(): void {
  }


}
