import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { StatsService, GlobalStats, ArticleStats } from '../../../../core/services/stats.service';

@Component({
  selector: 'app-stats-dashboard',
  templateUrl: './stats-dashboard.component.html',
  styleUrls: ['./stats-dashboard.component.css']
})
export class StatsDashboardComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  globalStats: GlobalStats | null = null;
  loading = true;
  error = '';
  selectedPeriod = 'daily';
  selectedLimit = 30;

  // Configuration des graphiques
  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    elements: {
      line: {
        tension: 0.4
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      title: {
        display: true,
        text: 'Évolution des Likes'
      }
    }
  };

  public lineChartType: ChartType = 'line';
  public lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Likes',
        backgroundColor: 'rgba(148,159,177,0.2)',
        borderColor: 'rgba(148,159,177,1)',
        pointBackgroundColor: 'rgba(148,159,177,1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(148,159,177,0.8)',
        fill: 'origin',
      }
    ]
  };

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      title: {
        display: true,
        text: 'Articles les Plus Likés'
      }
    }
  };

  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Likes',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  };

  constructor(private statsService: StatsService) {}

  ngOnInit(): void {
    this.loadGlobalStats();
  }

  loadGlobalStats(): void {
    this.loading = true;
    this.error = '';

    this.statsService.getGlobalStats(this.selectedPeriod, this.selectedLimit).subscribe({
      next: (stats) => {
        this.globalStats = stats;
        this.updateCharts();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des statistiques:', err);
        this.error = 'Erreur lors du chargement des statistiques';
        this.loading = false;
      }
    });
  }

  updateCharts(): void {
    if (!this.globalStats) return;

    // Mise à jour du graphique linéaire (évolution temporelle)
    this.updateLineChart();

    // Mise à jour du graphique en barres (articles les plus likés)
    this.updateBarChart();
  }

  updateLineChart(): void {
    if (!this.globalStats?.periodStats) return;

    const labels = this.globalStats.periodStats.map(stat => {
      if (stat.date) {
        const date = new Date(stat.date);
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      }
      return 'Date inconnue';
    });

    const data = this.globalStats.periodStats.map(stat => stat.likes || 0);

    this.lineChartData = {
      labels: labels,
      datasets: [
        {
          data: data,
          label: 'Likes',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          pointBackgroundColor: 'rgba(75, 192, 192, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(75, 192, 192, 0.8)',
          fill: 'origin',
          tension: 0.4
        }
      ]
    };
  }

  updateBarChart(): void {
    if (!this.globalStats?.topLikedArticles) return;

    const labels = this.globalStats.topLikedArticles.map(item => {
      const title = item.article?.title || 'Titre inconnu';
      return title.length > 20 ? title.substring(0, 20) + '...' : title;
    });

    const data = this.globalStats.topLikedArticles.map(item => item.stats?.totalLikes || 0);

    this.barChartData = {
      labels: labels,
      datasets: [
        {
          data: data,
          label: 'Likes',
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }
      ]
    };
  }

  onPeriodChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedPeriod = target.value;
    this.loadGlobalStats();
  }

  onLimitChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedLimit = parseInt(target.value);
    this.loadGlobalStats();
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Date non disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatNumber(num: number): string {
    return num.toLocaleString('fr-FR');
  }
} 