"use client";

import React, { useMemo } from 'react';
import { ChartContainer } from './chart-container';
import { useTheme } from 'next-themes';

interface SystemMetricsProps {
  metrics: {
    cpu: number;
    memory: number;
    disk: number;
  };
}

export function SystemMetrics({ metrics }: SystemMetricsProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const options = useMemo(() => {
    return {
      series: [
        {
          type: 'gauge',
          startAngle: 90,
          endAngle: -270,
          pointer: { show: false },
          progress: {
            show: true,
            overlap: false,
            roundCap: true,
            clip: false,
            itemStyle: { borderWidth: 1, borderColor: '#464646' },
          },
          axisLine: { lineStyle: { width: 40 } },
          splitLine: { show: false, distance: 0, length: 10 },
          axisTick: { show: false },
          axisLabel: { show: false, distance: 50 },
          data: [
            {
              value: metrics.cpu,
              name: 'CPU',
              title: { offsetCenter: ['0%', '-30%'] },
              detail: { valueAnimation: true, offsetCenter: ['0%', '-20%'] },
              itemStyle: { color: '#ef4444' }
            },
            {
              value: metrics.memory,
              name: 'Memory',
              title: { offsetCenter: ['0%', '0%'] },
              detail: { valueAnimation: true, offsetCenter: ['0%', '10%'] },
              itemStyle: { color: '#eab308' }
            },
            {
              value: metrics.disk,
              name: 'Disk',
              title: { offsetCenter: ['0%', '30%'] },
              detail: { valueAnimation: true, offsetCenter: ['0%', '40%'] },
              itemStyle: { color: '#3b82f6' }
            },
          ],
          title: { fontSize: 14 },
          detail: {
            width: 50,
            height: 14,
            fontSize: 14,
            color: 'inherit',
            borderColor: 'inherit',
            borderRadius: 20,
            borderWidth: 1,
            formatter: '{value}%',
          },
        },
      ],
    };
  }, [metrics, isDark]);

  return (
    <ChartContainer
      title="System Resource Usage"
      options={options}
      className="col-span-4 lg:col-span-1"
    />
  );
}
