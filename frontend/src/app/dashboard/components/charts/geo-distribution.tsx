"use client";

import React, { useMemo } from 'react';
import { ChartContainer } from './chart-container';
import { useTheme } from 'next-themes';

interface GeoDistributionProps {
  data: {
    country: string;
    count: number;
  }[];
}

export function GeoDistribution({ data }: GeoDistributionProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const options = useMemo(() => {
    const sortedData = [...data].sort((a, b) => a.count - b.count);

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        borderColor: isDark ? '#374151' : '#e5e7eb',
        textStyle: {
          color: isDark ? '#f3f4f6' : '#111827',
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        splitLine: {
          lineStyle: {
            color: isDark ? '#374151' : '#e5e7eb',
          },
        },
      },
      yAxis: {
        type: 'category',
        data: sortedData.map(d => d.country),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: isDark ? '#9ca3af' : '#4b5563',
        },
      },
      series: [
        {
          name: 'Peers',
          type: 'bar',
          data: sortedData.map(d => d.count),
          itemStyle: {
            borderRadius: [0, 4, 4, 0],
            color: '#3b82f6',
          },
          label: {
            show: true,
            position: 'right',
            color: isDark ? '#9ca3af' : '#4b5563',
          },
        },
      ],
    };
  }, [data, isDark]);

  return (
    <ChartContainer
      title="Peer Distribution by Country"
      options={options}
      className="col-span-4 lg:col-span-1"
    />
  );
}
