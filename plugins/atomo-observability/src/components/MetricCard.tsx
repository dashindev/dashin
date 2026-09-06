import { Card } from '@dashin-dev/dashin'

export interface MetricCardProps {
  label: string
  value: number | string
  loading?: boolean
  highlight?: boolean
  variant?: 'default' | 'success' | 'warning' | 'error'
  subtitle?: string
}

export function MetricCard({
  label,
  value,
  loading = false,
  highlight = false,
  variant = 'default',
  subtitle
}: MetricCardProps) {
  let colorClass = 'text-foreground'
  if (variant === 'error' || (highlight && typeof value === 'number' && value > 0)) {
    colorClass = 'text-red-600 dark:text-red-400'
  } else if (variant === 'success') {
    colorClass = 'text-emerald-600 dark:text-emerald-400'
  } else if (variant === 'warning') {
    colorClass = 'text-amber-600 dark:text-amber-400'
  }

  return (
    <Card className="p-4 flex flex-col justify-between">
      <div className="text-xs text-icon-muted uppercase tracking-wider font-medium">{label}</div>
      <div className={'text-2xl font-bold mt-2 mb-1 ' + colorClass}>
        {loading ? '—' : value}
      </div>
      {subtitle && <div className="text-[11px] text-icon-muted truncate">{subtitle}</div>}
    </Card>
  )
}
