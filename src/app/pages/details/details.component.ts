import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, map } from 'rxjs';
import { Olympic } from 'src/app/core/models/Olympic';
import { OlympicService } from 'src/app/core/services/olympic.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit, OnDestroy
{
  olympicsSubscription!: Subscription;

  countryName!: String;
  entriesCount!: Number;
  medalsCount!: Number;
  athleteCount!: Number;

  // Chart settings
  data!: [{ name : String, series: ({ name: String, value : Number }[] | undefined) }];
  xAxisLabel: string = 'Dates';
  colorScheme: any = {domain: ['#89A1DB']}
  //

  constructor(private olympicService: OlympicService,
              private route: ActivatedRoute,
              private router: Router) {}


  ngOnInit(): void {
    // Fetch olympic from route
    let countryName: string = this.route.snapshot.params['countryName'];
    this.olympicsSubscription = this.olympicService.getOlympics().pipe(map((olympics : Olympic[]) => olympics.find(o => o.country === countryName))).subscribe(data => this.onOlympicsFetched(data));
  }

  ngOnDestroy(): void {
    this.olympicsSubscription.unsubscribe();
  }

  onBackButtonClicked() : void {
    this.router.navigateByUrl('');
  }

  private onOlympicsFetched(data : Olympic | undefined) {
    // Navigate to NotFound Page if data is undefined
    if (data === undefined){
      this.router.navigateByUrl('**');
      return;
    }

    this.countryName = data.country;

    // If the country has no participations we can just stay with 0 everywhere
    if (data.participations === undefined)
      return;

    this.entriesCount = data.participations.length;
    this.medalsCount = data.participations.reduce((sum: number, p: { medalsCount: number }) => sum + p.medalsCount, 0);
    this.athleteCount = data.participations.reduce((sum: number, p: { athleteCount: number }) => sum + p.athleteCount, 0);

    // Fill chart
    this.data = this.formatOlympic(data);
  }

  // Return chart-friendly data structure from an olympic
  private formatOlympic(olympic: Olympic) : [{ name : String, series: ({ name: String, value : Number }[] | undefined) }] {
    return [{
      name : olympic.country,
      series : olympic.participations?.map(p => ({
        name : String(p.year),
        value : p.medalsCount
      }))
    }];
  }
}
