import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { DatabaseService, User, Drive } from '../../services/database.service';
import { Chart } from "chart.js";
import { PipesModule } from '../../pipes/pipes.module';
import * as dayjs from 'dayjs';

@Component({
  selector: 'app-commander',
  templateUrl: './commander.page.html',
  styleUrls: ['./commander.page.scss'],
})
export class CommanderPage implements OnInit {

  constructor(
    private navCtrl: NavController,
    public database: DatabaseService,
    private platform: Platform
  ) { }
  
  ngOnInit() {
  }
  
  public checkOperatorCurrencyValid(vehicletype:string, date:any){
    const today = dayjs();
    var period = vehicletype==="BELREX" ? 30 : 7;
    return today.diff(date,"day") < period ;
  }
  
  public checkOperatorCurrencyInvalid(vehicletype:string, date:any){
    const today = dayjs();
    var period = vehicletype==="BELREX" ? 30 : 7;
    return today.diff(date,"day") > period ;
  }

  public getPendingDrives() : Drive[] {
    return this.database.current.drive_history.filter( (drive) => {
      return drive.status === 'pending';
    });
  }

  public getApprovedDrives() : Drive[] {
    return this.database.current.drive_history.filter( (drive) => {
      return drive.status === 'verified';
    });
  }
  
  public click(drive: Drive): void {
    this.database.current.drive_to_edit = drive;
    console.log(`> Navigating to AddDrivePage for drive id=${drive.id}`);
    this.navCtrl.navigateForward(['/add-drive']);
  }
}
