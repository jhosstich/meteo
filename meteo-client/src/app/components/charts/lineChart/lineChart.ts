import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NgApexchartsModule,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexStroke,
  ApexTooltip,
  ApexDataLabels,
  ApexLegend,
} from 'ng-apexcharts';

@Component({
  selector: 'line-chart-component',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './lineChart.html',
})
export class LineChartComponent implements OnChanges {
  @Input() series: ApexAxisChartSeries = [];
  @Input() categories: string[] = [];

  chart: ApexChart = {
    type: 'line',
    height: 450,
    animations: {
      enabled: true,
    },
    toolbar: {
      tools: {
        zoomin: false,
        zoomout: false,
        zoom: false,
        reset: false,
        pan: false,
      },
    },
  };

  xaxis: ApexXAxis = {
    categories: [],
    title: {
      text: 'tiempo',
    },
    labels: {
      rotate: -45,
      formatter: (value: string, timestamp: number, opts: any) => {
        // value → "HH:MM:SS"
        if (!value) return '';
       const [hh, mm, ss] = value.split(':');

        // Solo mostrar cuando SS === "00"
        if (ss === '00') {
          return `${hh}:${mm}`;
        }

        return ''; // oculta el resto de segundos
      }
    }
  };

  yaxis: ApexYAxis | ApexYAxis[] = [
    {
      seriesName: 'Temperature',
      title: {
        text: 'Temperature (ºC)',
      },
    },
    {
      opposite: true,
      seriesName: 'Energy',
      title: {
        text: 'Energy (kWh)',
      },
    },
  ];

  stroke: ApexStroke = {
    curve: 'smooth',
  };

  dataLabels: ApexDataLabels = {
    enabled: false,
  };

  tooltip: ApexTooltip = {
    shared: true,
    intersect: false,
  };

  legend: ApexLegend = {
    show: true,
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categories']) {
      this.xaxis = {
        ...this.xaxis,
        categories: this.categories,
      };
    }
  }
}
