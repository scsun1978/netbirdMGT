"use client";

import React, { useMemo } from 'react';
import { ChartContainer } from './chart-container';
import { useTheme } from 'next-themes';
import { AlertTrendData } from '@/types/dashboard.types';

interface AlertTrendsProps {
  data: AlertTrendData[];
}

export function AlertTrends({ data }: AlertTrendsProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const options = useMemo(() => {
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        borderColor: isDark ? '#374151' : '#e5e7eb',
        textStyle: {
          color: isDark ? '#f3f4f6' : '#111827',
        },
      },
      legend: {
        data: ['Critical', 'High', 'Medium', 'Low'],
        textStyle: {
          color: isDark ? '#9ca3af' : '#4b5563',
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data.map(d => new Date(d.timestamp).toLocaleDateString()),
        axisLine: {
          lineStyle: {
            color: isDark ? '#4b5563' : '#9ca3af',
          },
        },
      },
      yAxis: {
        type: 'value',
        splitLine: {
          lineStyle: {
            color: isDark ? '#374151' : '#e5e7eb',
          },
        },
      },
      series: [
        {
          name: 'Critical',
          type: 'line',
          stack: 'Total',
          smooth: true,
          areaStyle: {},
          emphasis: { focus: 'series' },
          data: data.map(d => d.critical),
          itemStyle: { color: '#ef4444' },
        },
        {
          name: 'High',
          type: 'line',
          stack: 'Total',
          smooth: true,
          areaStyle: {},
          emphasis: { focus: 'series' },
          data: data.map(d => d.high),
          itemStyle: { color: '#f97316' },
        },
        {
          name: 'Medium',
          type: 'line',
          stack: 'Total',
          smooth: true,
          areaStyle: {},
          emphasis: { focus: 'series' },
          data: data.map(d => d.medium),
          itemStyle: { color: '#eab308' },
        },
        {
          name: 'Low',
          type: 'line',
          stack: 'Total',
          smooth: true,
          areaStyle: {},
          emphasis: { focus: 'series' },
          data: data.map(d => d.low),
          itemStyle: { color: '#3b82f6' },
        },
      ],
    } as any;
  }, [data, isDark]);

  return (
    <ChartContainer
      title="Alert Trends"
      options={options}
      className="col-span-4 lg:col-span-1"
    />
  );
}
