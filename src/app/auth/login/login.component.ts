import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AuthService } from '../auth.service'
import { TranslateService } from '@ngx-translate/core';
import { NotifierService } from "angular-notifier";
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  /** form for login */
  loginForm: FormGroup = this.fb.group({})
  private readonly notifier: NotifierService;

  constructor(
    private fb: FormBuilder,
    public translate: TranslateService,
    public AuthService: AuthService,
    notifierService: NotifierService,
    private router: Router
  ) {
    this.notifier = notifierService;
    translate.setDefaultLang('fr');
   }

  ngOnInit(): void {
    this.initialiseLoginForm()
  }

  /**
   * initilialise login form
   */
  initialiseLoginForm() {
    this.loginForm.addControl('email', new FormControl('', Validators.compose([Validators.required, Validators.email])))
    this.loginForm.addControl('password', new FormControl('', Validators.required))
  }

  /**
   * submit login form 
   */
  submitLoginForm() {
    this.AuthService.login(this.loginForm.value.email, this.loginForm.value.password).then(
      (response: {
        error: boolean;
        msg?: string;
      }) => {
        if (response.error) {

          this.translate.get('login', { value: 'caracteristique' }).subscribe((res: any) => {
            this.notifier.notify("error", res.error);
          })

        }else{
          this.router.navigate(['admin'])
        }
      }
    )
  }

}
