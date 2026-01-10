"use client";

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TimeRange } from "@/types/dashboard.types";

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
}

export function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  return (
    <Select value={value} onValueChange={(val) => onChange(val as TimeRange)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select time range" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="1h">Last Hour</SelectItem>
        <SelectItem value="24h">Last 24 Hours</SelectItem>
        <SelectItem value="7d">Last 7 Days</SelectItem>
        <SelectItem value="30d">Last 30 Days</SelectItem>
        <SelectItem value="custom">Custom Range</SelectItem>
      </SelectContent>
    </Select>
  );
}
