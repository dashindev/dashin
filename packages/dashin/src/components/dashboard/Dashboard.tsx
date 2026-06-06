import React, { useEffect, useState } from "react"
import { ENV } from "@dashin-dev/dashin"
import { execute } from "@dashin-dev/source-d1"

import Card from "../ui/Card"
import StatBand, { Stat } from "../regions/StatBand"
import TrendChart from "../charts/TrendChart"
import BarChart from "../charts/BarChart"
import Donut, { DonutSegment } from "../charts/Donut"
import {
  CUSTOMER_LOOKUP,
  ORDER_STATUS_LOOKUP,
  money
} from "../../private/plugins/dashin-plugin-dashin-d1/lookups"
import {
  STATUS_COLORS,
  buildDayAxis,
  computeDelta,
  dailySalesQuery,
  mergeDailySeries,
  newCustomersQuery,
  activeProductsQuery,
  recentOrdersQuery,
  statusBreakdownQuery,
  topCategoriesQuery,
  totalsQuery,
  Stmt
} from "./queries"

const DAYS = 30
const STATUS_ORDER = ["paid", "shipped", "pending", "cancelled"]

const num = (rows: any[], field = "c"): number => Number(rows?.[0]?.[field] ?? 0)
const delta = (pct: number) => `${pct > 0 ? "▲" : pct < 0 ? "▼" : "•"} ${Math.abs(pct)}% vs prev 7d`

// Minimal lucide-style stroke icons for the KPI chips.
const ic = (d: React.ReactNode) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
)
const ICONS = {
  revenue: ic(<><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></>),
  orders: ic(<><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></>),
  customers: ic(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /></>),
  products: ic(<><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /></>)
}

interface Data {
  kpis: Stat[]
  revSeries: number[]
  axisLabels: string[]
  status: DonutSegment[]
  totalOrders: number
  topCats: { label: string; value: number }[]
  recent: any[]
}

export default function Dashboard() {
  const [data, setData] = useState<Data | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    const run = (s: Stmt) => execute(s, ENV.MAIN_URL)
    ;(async () => {
      try {
        const [daily, status, cats, recent, custTotal, prodTotal, prodActive, newCust] =
          await Promise.all([
            run(dailySalesQuery(DAYS)),
            run(statusBreakdownQuery()),
            run(topCategoriesQuery(6)),
            run(recentOrdersQuery(6)),
            run(totalsQuery("customers")),
            run(totalsQuery("products")),
            run(activeProductsQuery()),
            run(newCustomersQuery(DAYS))
          ])

        // Degrade gracefully: a single transient failure (e.g. the gateway's
        // per-IP rate limit on the query burst) shouldn't blank the whole
        // dashboard — each section falls back to its empty data below. Only
        // surface the error card if EVERY query failed (gateway unreachable).
        const all = [daily, status, cats, recent, custTotal, prodTotal, prodActive, newCust]
        if (all.every(r => r.error)) {
          const e = all[0].error
          throw new Error(typeof e === "string" ? e : JSON.stringify(e))
        }

        const axis = buildDayAxis(new Date(), DAYS)
        const revSeries = mergeDailySeries(daily.rows, axis, "revenue")
        const ordSeries = mergeDailySeries(daily.rows, axis, "orders")
        const revTotal = revSeries.reduce((s, v) => s + v, 0)
        const ordTotal = ordSeries.reduce((s, v) => s + v, 0)
        const revD = computeDelta(revSeries, 7)
        const ordD = computeDelta(ordSeries, 7)

        const statusMap = new Map<string, number>(
          (status.rows || []).map((r: any) => [String(r.status), Number(r.c) || 0])
        )
        const segs: DonutSegment[] = STATUS_ORDER.filter(s => statusMap.has(s)).map(s => ({
          label: ORDER_STATUS_LOOKUP[s] || s,
          value: statusMap.get(s) || 0,
          color: STATUS_COLORS[s] || "#94a3b8"
        }))

        const kpis: Stat[] = [
          {
            label: "Revenue (30d)",
            value: money(revTotal),
            delta: delta(revD.pct),
            trend: revD.trend,
            icon: ICONS.revenue,
            spark: revSeries
          },
          {
            label: "Orders (30d)",
            value: ordTotal,
            delta: delta(ordD.pct),
            trend: ordD.trend,
            icon: ICONS.orders,
            spark: ordSeries
          },
          {
            label: "Customers",
            value: num(custTotal.rows),
            delta: `+${num(newCust.rows)} new (30d)`,
            trend: num(newCust.rows) > 0 ? "up" : "neutral",
            icon: ICONS.customers
          },
          {
            label: "Products",
            value: num(prodTotal.rows),
            delta: `${num(prodActive.rows)} active`,
            trend: "neutral",
            icon: ICONS.products
          }
        ]

        if (alive)
          setData({
            kpis,
            revSeries,
            axisLabels: axis.map(d => d.slice(5).replace("-", "/")),
            status: segs,
            totalOrders: (status.rows || []).reduce((s: number, r: any) => s + (Number(r.c) || 0), 0),
            topCats: (cats.rows || []).map((r: any) => ({ label: r.label, value: Number(r.value) || 0 })),
            recent: recent.rows || []
          })
      } catch (e: any) {
        if (alive) setError(e?.message || String(e))
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{ENV.SITE_NAME} Store</h1>
        <p className="text-sm text-icon-muted">
          A live e-commerce admin on Cloudflare D1 — fully editable. Demo data resets every 30 minutes.
        </p>
      </div>

      {error ? (
        <Card className="p-6 text-sm text-danger">
          Couldn’t load dashboard data: {error}
        </Card>
      ) : !data ? (
        <Skeleton />
      ) : (
        <>
          <StatBand stats={data.kpis} />

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="p-5 lg:col-span-2">
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="font-medium text-foreground">Revenue · last 30 days</h2>
                <span className="text-sm text-icon-muted">{money(data.revSeries.reduce((s, v) => s + v, 0))}</span>
              </div>
              <TrendChart points={data.revSeries} labels={data.axisLabels} format={money} />
            </Card>
            <Card className="p-5">
              <h2 className="mb-3 font-medium text-foreground">Orders by status</h2>
              <Donut data={data.status} centerValue={data.totalOrders} centerLabel="orders" />
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <h2 className="mb-4 font-medium text-foreground">Products by category</h2>
              <BarChart data={data.topCats} />
            </Card>
            <Card className="p-5">
              <h2 className="mb-3 font-medium text-foreground">Recent orders</h2>
              <ul className="divide-y divide-bn-border">
                {data.recent.map((o: any) => (
                  <li key={o.id} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-foreground">
                      #{o.id} · {CUSTOMER_LOOKUP[o.customer_id] || `Customer ${o.customer_id}`}
                    </span>
                    <span className="flex items-center gap-3">
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{ background: (STATUS_COLORS[o.status] || "#94a3b8") + "22", color: STATUS_COLORS[o.status] || "#64748b" }}
                      >
                        {ORDER_STATUS_LOOKUP[o.status] || o.status}
                      </span>
                      <span className="text-icon-muted">{money(o.total)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

function Skeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-bn border border-bn-border bg-content-box" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="h-64 animate-pulse rounded-bn border border-bn-border bg-content-box lg:col-span-2" />
        <div className="h-64 animate-pulse rounded-bn border border-bn-border bg-content-box" />
      </div>
    </div>
  )
}
