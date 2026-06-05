import React from "react"
import { Stat } from "../regions/StatBand"

/**
 * Lets a deeply-nested <Table> push computed list-page stats up to the
 * <StatBand> rendered by DefaultLayout. `setStats(null)` clears them.
 */
export interface StatsContextValue {
  setStats?: (stats: Stat[] | null) => void
}

export const StatsContext = React.createContext<StatsContextValue>({})
