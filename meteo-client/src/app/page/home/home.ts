import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { TemperatureMsg, TemperatureService } from '../../services/temperature.service';
import { LineChartComponent } from '../../components/charts/lineChart/lineChart';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, LineChartComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class Home implements OnInit, OnDestroy {
  latest$!: Observable<TemperatureMsg | null>;
  temperatures = signal<TemperatureMsg[]>([]);
  private sub?: Subscription;
  // Eje X
  categories: string[] = [];

  // Series para el gráfico (Y1 = temp, Y2 = energía)
  series: ApexAxisChartSeries = [
    {
      name: 'Temperature',
      data: [] as number[],
    },
    {
      name: 'Energy',
      data: [] as number[],
    },
  ];
  constructor(private temperatureService: TemperatureService) { }

  ngOnInit(): void {
    this.latest$ = this.temperatureService.latest$;

    this.sub = this.latest$.subscribe((next) => {
      if (!next) return;
      console.log(next);
      this.temperatures.update((prev) => [...prev, next]);
      this.categories = [...this.categories, next.time];
      const tempSeries = this.series[0];
      const energySeries = this.series[1];

      this.series = [
        {
          ...tempSeries,
          data: [...(tempSeries.data as number[]), next.value],
        },
        {
          ...energySeries,
          data: [...(energySeries.data as number[]), next.energyKWh],
        },
      ];
    });

  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();         // 👈 importante
    this.temperatureService.disconnect();
  }
}
