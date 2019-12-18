import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NavController } from '@ionic/angular';
import { DatabaseService, VehicleTypes, Drive } from '../../services/database.service';
import * as dayjs from 'dayjs';
import { Chart } from "chart.js";
import { PipesModule } from '../../pipes/pipes.module';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.page.html',
  styleUrls: ['./summary.page.scss'],
})
export class SummaryPage implements OnInit {

  constructor( 
    public database: DatabaseService,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    this.initCharts();    
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



  public getNotifications() {

    var result: Array<any> = [];
    for (let trip of this.database.current.drive_history) {

      let date_str = dayjs(`${trip.date} ${trip.start_time}`,'YYYY-MM-DD HH:mm').format('dddd, MMM DD, YYYY');
      let distance = this.database.distance(trip);
      let drive_msg = `Completed ${distance} km drive, from ${trip.start_location} (${trip.start_time}) to ${trip.end_location} (${trip.end_time}).`;

      if (trip.status === 'in-progress') {
        result.push( { 
          subtitle: "Drive-In-Progress",
          title: date_str,
          text: `Journey started from location ${trip.start_location} at ${trip.start_time}.`,
          trip: trip
        });
      } else
      if (trip.status === 'pending') {
        result.push( { 
          subtitle: "Awaiting Review",
          title: date_str,
          text: drive_msg, 
          trip: trip
        });
      } else
      if (trip.status === 'rejected') {
        result.push( { 
          subtitle: "Drive Rejected (Action Required)",
          title: date_str,
          text: drive_msg, 
          trip: trip
        });
      }
    }
    return result;
  }
  
  public click(drive: Drive): void {
    this.database.current.drive_to_edit = drive;
    console.log(`> Navigating to AddDrivePage for drive id=${drive.id}`);
    this.navCtrl.navigateForward(['/add-drive']);
  }

  // Charts
  // References: https://www.joshmorony.com/adding-responsive-charts-graphs-to-ionic-2-applications/  

  @ViewChild("chartCanvas1", {static:true}) chartCanvas1: ElementRef;
  @ViewChild("chartCanvas2", {static:true}) chartCanvas2: ElementRef;
  @ViewChild("chartCanvas3", {static:true}) chartCanvas3: ElementRef;

  private initCharts(): void {
    this.makeChart1(this.chartCanvas1);
    this.makeChart2(this.chartCanvas2, this.database.current.stats.mileage_by_vehicle_type);
    this.makeChart3(this.chartCanvas3, this.database.current.stats.mileage_km, 5000);
  }

  private makeChart1(canvas: ElementRef): Chart {
    return new Chart(canvas.nativeElement, {
      type: "line",
      data: {
        labels: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
        datasets: [
          {
            label: "Your Mileage",
            data: [4, 13, 27, 36, 44, 18, 12, 19, 28, 61, 47, 59],
            borderWidth: 2,
            borderColor: "rgba(255,99,132,1)",
            backgroundColor: "rgba(255,99,132,.2)"
          },
          {
            label: "Peer Average",
            data: [32, 23, 17, 26, 29, 32, 27, 29, 40, 31, 37, 29],
            borderWidth: 1,
            borderColor: "rgba(54, 162, 235, 1)",
            backgroundColor: "rgba(54, 162, 235, .2)"
          }
        ]
      },
      options: {
        title: {
            display: true,
            text: 'Your Mileage by Month'
        },
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true
              }
            }
          ]
        }
      }
    });
  }

  private makeChart2(canvas: ElementRef, data: any): Chart {

    var mileage = [];
    for (var type of VehicleTypes) {
      mileage.push(data[type]);
    }
    
    return new Chart(canvas.nativeElement, {
      type: "bar",
      data: {
        labels: VehicleTypes,
        datasets: [
        {
          label: "Your Mileage by Vehicle Types",
//          data: [54, 13, 227, 136],
          data: mileage,
          borderWidth: 2,
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(255, 206, 86, 0.2)",
            "rgba(75, 192, 192, 0.2)",
            "rgba(153, 102, 255, 0.2)",
            "rgba(255, 159, 64, 0.2)"
          ],
          borderColor: [
            "rgba(255,99,132,1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)"
          ],
        },
      ]
      },
      options: {
        title: {
          display: true,
          text: 'Your Mileage by Vehicle Types'
        },
        legend: {
          display: false
        },
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true
              }
            }
          ]
        }
      }
    });
  }

  private makeChart3(canvas: ElementRef, value: number, max_value: number): Chart {
    return new Chart(canvas.nativeElement, {
      type:"doughnut",
      data: {
          labels : ["Your Mileage",`${max_value} KM`],
          datasets: [{
              label: "Gauge",
              data : [value, max_value],
              backgroundColor: [
                  "rgb(255, 99, 132)",
                  "rgb(54, 162, 235)",
                  "rgb(255, 205, 86)"
              ]
          }]
      },
      options: {
        title: {
          display: true,
          text: 'Licence Conversion'
        },
        circumference: Math.PI,
        rotation : Math.PI,
        cutoutPercentage : 80,
      }
    });
  }
}
