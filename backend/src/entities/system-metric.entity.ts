import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';

export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
}

@Entity('system_metrics')
@Index(['metricName'])
@Index(['timestamp'])
@Index(['metricName', 'timestamp'])
export class SystemMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  metricName: string;

  @Column({
    type: 'enum',
    enum: MetricType,
  })
  metricType: MetricType;

  @Column({ type: 'numeric' })
  value: number;

  @Column({ nullable: true })
  unit: string;

  @Column({ type: 'jsonb', default: '{}' })
  labels: Record<string, any>;

  @Column({ type: 'timestamp with time zone' })
  timestamp: Date;
}