import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SVG } from '@svgdotjs/svg.js';
import { NotifierService } from 'angular-notifier';
import { combineLatest, EMPTY, Observable, ReplaySubject } from 'rxjs';
import { filter, switchMap, map, catchError, startWith, tap, takeUntil } from 'rxjs/operators';
import { IconsComponent } from '../content/icons/icons.component';
import { IconWithSVGContent } from '../content/maps/detail-map/group/add-group/add-group.component';
import {IconService} from '../service/icon.service'

@Component({
  selector: 'app-generate-icon',
  templateUrl: './generate-icon.component.html',
  styleUrls: ['./generate-icon.component.scss']
})
export class GenerateIconComponent implements OnInit {
  /**
   * The icon id use to generate the icon 
   */
  @Input() icon:FormControl
  /**
   * The background color of the icon
   */
  @Input() backgroundColor:Observable<string>
  /**
   * the circle svg icon as text
   */
  @Input() circleSvgAsText: FormControl
  /**
   * Icon selected in data osm gallery
   */
  iconSelected:Observable<IconWithSVGContent> 
  @ViewChild(IconsComponent) iconComponent: IconsComponent;
  @ViewChild('iconOrigin') iconOrigin: ElementRef<HTMLElement>;
  @ViewChild('circleSvg') circleSvg: ElementRef<HTMLElement>;
  
  private readonly notifier: NotifierService;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    notifierService: NotifierService,
    public IconService:IconService, 
  ) {
    this.notifier = notifierService;
   }

  ngOnInit(): void {
  }
  ngAfterViewInit() {

    this.iconSelected = this.iconComponent.onIconSelect.pipe(
      filter((icon)=> icon.path.includes('.svg')),
      switchMap((icon)=>{
        return this.IconService.loadSvgContent(icon.path).pipe(
          map((svgContent:string)=>{
            return Object.assign(icon,{svgContent:svgContent})
          }),
          catchError((err) => {this.notifier.notify("error", "An error occured while loading icons"); return EMPTY })
        )
      })
    )

    combineLatest(this.iconSelected, this.backgroundColor.pipe(startWith('#02aca7'))).pipe(
      filter( (value:[IconWithSVGContent,string]) => value[0] && value[0].svgContent != undefined),
      tap((value:[IconWithSVGContent,string])=>{
        let icon = value[0]
        let form = value[1]

        Array.from(this.iconOrigin.nativeElement.children).map(child=> this.iconOrigin.nativeElement.removeChild(child))
        Array.from(this.circleSvg.nativeElement.children).map(child=> this.circleSvg.nativeElement.removeChild(child))

        try {
          this.iconOrigin.nativeElement.appendChild(new DOMParser().parseFromString(icon.svgContent,'text/xml').firstChild )

          let circle = SVG().addTo(this.circleSvg.nativeElement).size(100, 100)
          circle.circle(100).attr({ fill: value[1]})
      
          SVG(this.iconOrigin.nativeElement.firstChild).size(60, 60).each(function (i, children) {
            this.fill({ color: '#fff' })
          },true)
            .move(20, 16)
            .addTo(circle)
            
          this.circleSvgAsText.setValue(this.circleSvg.nativeElement.innerHTML)  
          this.icon.setValue(value[0].icon_id)

        } catch (error) {
          this.notifier.notify("error", "Sorry, can not to load this icon ! due to "+error.toString());
          Array.from(this.iconOrigin.nativeElement.children).map(child=> this.iconOrigin.nativeElement.removeChild(child))
          Array.from(this.circleSvg.nativeElement.children).map(child=> this.circleSvg.nativeElement.removeChild(child))
        }

      }),
      takeUntil(this.destroyed$)
    ).subscribe()


  }

  ngOnDestroy():void{
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}
