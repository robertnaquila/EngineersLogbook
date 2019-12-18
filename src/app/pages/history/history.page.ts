import { Component, OnInit } from '@angular/core';
import { DatabaseService, Drive, VehicleTypes } from '../../services/database.service';
import * as dayjs from 'dayjs'; // DateTime utility, See http://zetcode.com/javascript/dayjs/

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
})
export class HistoryPage implements OnInit {

  select_month: number = 0;
  select_year: number = 0;
  
  constructor(private database: DatabaseService) { }

  ngOnInit() {
    this.buildChart();
  }

  public getDrives() : Drive[] {

    var drives = this.database.current.drive_history;

    if (!this.select_month && !this.select_year) return drives; // No filter

    return drives.filter( (drive) => {
      var elem = drive.date.split("-");
      return (!this.select_year||parseInt(elem[0])==this.select_year) 
        && (!this.select_month||parseInt(elem[1])==this.select_month);
    });
  }
  
  public getFilterPeriodString(): string {
    if (this.select_month==0 || this.select_year==0) {
      return "All";
    } else {
      const dt = dayjs(new Date(this.select_year, this.select_month-1, 1));  // months in dayjs, Jan=0
      return dt.format("MMMM, YYYY");
    }
  }
  
  public incrementFilterPeriod(delta: number) {

    const today = dayjs();

    var changed: boolean = true;
    
    if (delta==-1) {
      if (!this.select_month || !this.select_year) {
        // Current month/year
        this.select_month = today.month()+1;
        this.select_year = today.year();
      } else {
        this.select_month--;
        if (this.select_month==0) { 
          // Roll back to previous year
          this.select_year--; 
          this.select_month = 12;
        }
      }
    } else {
      if (!this.select_month || !this.select_year) {
        // Can't increment
        changed = false;
      } else {
        // When incrementing beyond current month/year, select "all"
        if (this.select_year==today.year() && (this.select_month-1)==today.month()) {
          this.select_year = this.select_month = 0;
        } else {
          this.select_month++;
          if (this.select_month==13) { 
            // Roll over to next year
            this.select_year++; 
            this.select_month = 1;
          }
        }
      }
    }
    if (changed) this.buildChart();
  }

  // Build Doughnut chart of mileage per VehicleType
  public chartLabels:string[] = VehicleTypes;
  public chartData:number[] = [ 0,0,0,0 ];
  public chartType:string = 'doughnut';

  private buildChart(): void {

    var count:number[] = Array(VehicleTypes.length).fill(0)
    
    this.getDrives().map( (trip) => {
      var valid_type = false;
      for (let i=0; i<VehicleTypes.length; i++) {
        if (trip.vehicle_type === VehicleTypes[i]) {
          count[i] += this.database.distance(trip);
          valid_type = true;
        }
      }
      if (!valid_type) { console.log(`### Error: Invalid vehicle type: ${trip.vehicle_type} in ${trip.id}`); }
    });
    
    //console.log(`>buildChart() = ${count}`);
    this.chartData = count;
  }
  
  public chartClicked(e:any):void {
    //console.log(e);
  }
  public chartHovered(e:any):void {
    //console.log(e);
  }
}
