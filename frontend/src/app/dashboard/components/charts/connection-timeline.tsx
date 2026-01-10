"use client";

import React, { useMemo } from 'react';
import { ChartContainer } from './chart-container';
import { useTheme } from 'next-themes';
import * as echarts from 'echarts';

interface ConnectionTimelineProps {
  data: {
    timestamp: string;
    online: number;
    total: number;
  }[];
}

export function ConnectionTimeline({ data }: ConnectionTimelineProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const options = useMemo(() => {
    return {
      tooltip: {
        trigger: 'axis',
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
        type: 'category',
        boundaryGap: false,
        data: data.map(d => new Date(d.timestamp).toLocaleTimeString()),
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
            type: 'dashed',
          },
        },
      },
      series: [
        {
          name: 'Online Peers',
          type: 'line',
          smooth: true,
          showSymbol: false,
          areaStyle: {
            opacity: 0.1,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#10b981' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.01)' },
            ]),
          },
          lineStyle: {
            width: 3,
            color: '#10b981',
          },
          data: data.map(d => d.online),
        },
        {
          name: 'Total Peers',
          type: 'line',
          smooth: true,
          showSymbol: false,
          lineStyle: {
            width: 2,
            type: 'dashed',
            color: '#6366f1',
          },
          data: data.map(d => d.total),
        },
      ],
    };
  }, [data, isDark]);

  return (
    <ChartContainer
      title="Connection Timeline"
      options={options}
      className="col-span-4 lg:col-span-2"
    />
  );
}
