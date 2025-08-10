"use client";
import { useState, useEffect, useRef } from "react";

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
    fill?: boolean;
  }[];
}

interface AnalyticsChartProps {
  type: "line" | "bar" | "doughnut" | "pie";
  data: ChartData;
  title: string;
  height?: number;
  options?: any;
}

// Simple chart implementation without external dependencies
export default function AnalyticsChart({ type, data, title, height = 300 }: AnalyticsChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!canvasRef.current || !data.datasets.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, height);

    try {
      if (type === 'bar') {
        drawBarChart(ctx, data, rect.width, height);
      } else if (type === 'line') {
        drawLineChart(ctx, data, rect.width, height);
      } else if (type === 'doughnut' || type === 'pie') {
        drawDoughnutChart(ctx, data, rect.width, height, type === 'doughnut');
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Chart rendering error:', error);
      setIsLoading(false);
    }
  }, [data, type, height]);

  const drawBarChart = (ctx: CanvasRenderingContext2D, chartData: ChartData, width: number, height: number) => {
    const padding = 60;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    const maxValue = Math.max(...chartData.datasets.flatMap(d => d.data));
    const barWidth = chartWidth / chartData.labels.length * 0.8;
    const barSpacing = chartWidth / chartData.labels.length * 0.2;

    // Draw axes
    ctx.strokeStyle = '#dee2e6';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Draw bars
    chartData.datasets.forEach((dataset, datasetIndex) => {
      const colors = Array.isArray(dataset.backgroundColor) 
        ? dataset.backgroundColor 
        : [dataset.backgroundColor || '#007bff'];
      
      dataset.data.forEach((value, index) => {
        const barHeight = (value / maxValue) * chartHeight;
        const x = padding + (index * (barWidth + barSpacing)) + (datasetIndex * barWidth / chartData.datasets.length);
        const y = height - padding - barHeight;
        
        ctx.fillStyle = colors[index % colors.length] || '#007bff';
        ctx.fillRect(x, y, barWidth / chartData.datasets.length, barHeight);
        
        // Draw value labels
        ctx.fillStyle = '#495057';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(value.toString(), x + barWidth / chartData.datasets.length / 2, y - 5);
      });
    });

    // Draw labels
    ctx.fillStyle = '#6c757d';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    chartData.labels.forEach((label, index) => {
      const x = padding + (index * (barWidth + barSpacing)) + barWidth / 2;
      const y = height - padding + 20;
      ctx.fillText(label, x, y);
    });
  };

  const drawLineChart = (ctx: CanvasRenderingContext2D, chartData: ChartData, width: number, height: number) => {
    const padding = 60;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    const maxValue = Math.max(...chartData.datasets.flatMap(d => d.data));
    const minValue = Math.min(...chartData.datasets.flatMap(d => d.data));
    const valueRange = maxValue - minValue || 1;

    // Draw grid
    ctx.strokeStyle = '#f1f3f4';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i * chartHeight / 5);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = '#dee2e6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Draw lines
    chartData.datasets.forEach((dataset) => {
      ctx.strokeStyle = dataset.borderColor || '#007bff';
      ctx.lineWidth = dataset.borderWidth || 2;
      ctx.fillStyle = dataset.backgroundColor || 'rgba(0, 123, 255, 0.1)';
      
      ctx.beginPath();
      dataset.data.forEach((value, index) => {
        const x = padding + (index * chartWidth / (dataset.data.length - 1));
        const y = height - padding - ((value - minValue) / valueRange * chartHeight);
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      if (dataset.fill) {
        ctx.lineTo(width - padding, height - padding);
        ctx.lineTo(padding, height - padding);
        ctx.closePath();
        ctx.fill();
      }
      ctx.stroke();

      // Draw points
      ctx.fillStyle = dataset.borderColor || '#007bff';
      dataset.data.forEach((value, index) => {
        const x = padding + (index * chartWidth / (dataset.data.length - 1));
        const y = height - padding - ((value - minValue) / valueRange * chartHeight);
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
      });
    });

    // Draw labels
    ctx.fillStyle = '#6c757d';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    chartData.labels.forEach((label, index) => {
      const x = padding + (index * chartWidth / (chartData.labels.length - 1));
      const y = height - padding + 20;
      ctx.fillText(label, x, y);
    });
  };

  const drawDoughnutChart = (ctx: CanvasRenderingContext2D, chartData: ChartData, width: number, height: number, isDoughnut: boolean) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 40;
    const innerRadius = isDoughnut ? radius * 0.6 : 0;

    const total = chartData.datasets[0].data.reduce((sum, value) => sum + value, 0);
    let currentAngle = -Math.PI / 2; // Start at top

    const colors = Array.isArray(chartData.datasets[0].backgroundColor)
      ? chartData.datasets[0].backgroundColor
      : ['#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8'];

    chartData.datasets[0].data.forEach((value, index) => {
      const sliceAngle = (value / total) * 2 * Math.PI;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      if (isDoughnut) {
        ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
      } else {
        ctx.lineTo(centerX, centerY);
      }
      ctx.closePath();
      
      ctx.fillStyle = colors[index % colors.length];
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw labels
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelRadius = radius * 0.8;
      const labelX = centerX + Math.cos(labelAngle) * labelRadius;
      const labelY = centerY + Math.sin(labelAngle) * labelRadius;
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.round((value / total) * 100)}%`, labelX, labelY);

      currentAngle += sliceAngle;
    });

    // Draw center text for doughnut
    if (isDoughnut) {
      ctx.fillStyle = '#495057';
      ctx.font = 'bold 24px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(total.toString(), centerX, centerY);
      ctx.font = '14px Inter';
      ctx.fillText('Total', centerX, centerY + 20);
    }
  };

  const getLegend = () => {
    if (type === 'doughnut' || type === 'pie') {
      const colors = Array.isArray(data.datasets[0].backgroundColor)
        ? data.datasets[0].backgroundColor
        : ['#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8'];

      return data.labels.map((label, index) => (
        <div key={index} className="d-flex align-items-center me-3 mb-1">
          <div 
            className="me-2" 
            style={{ 
              width: '12px', 
              height: '12px', 
              backgroundColor: colors[index % colors.length],
              borderRadius: '2px'
            }}
          />
          <small className="text-muted">{label}</small>
        </div>
      ));
    }

    return data.datasets.map((dataset, index) => (
      <div key={index} className="d-flex align-items-center me-3 mb-1">
        <div 
          className="me-2" 
          style={{ 
            width: '12px', 
            height: '12px', 
            backgroundColor: dataset.borderColor || dataset.backgroundColor,
            borderRadius: '2px'
          }}
        />
        <small className="text-muted">{dataset.label}</small>
      </div>
    ));
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
      </div>
      <div className="card-body">
        {isLoading && (
          <div className="d-flex justify-content-center align-items-center" style={{ height: `${height}px` }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
        
        <div style={{ position: 'relative', height: `${height}px` }}>
          <canvas
            ref={canvasRef}
            style={{ 
              width: '100%', 
              height: '100%',
              display: isLoading ? 'none' : 'block'
            }}
          />
        </div>

        {/* Legend */}
        <div className="d-flex flex-wrap mt-3">
          {getLegend()}
        </div>
      </div>
    </div>
  );
}