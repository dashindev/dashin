/**
 * Remote data controller
 */
import { Query } from "material-table"
import { notice } from "@bunred/bunadmin"
import listSer from "../services/listSer"

export default async function dataCtrl<RowData extends object>(
  query: Query<RowData>
) {
  const { data, errors, totalCount } = await listSer(query)

  if (errors) {
    await notice({
      title: "Fetch error",
      severity: "error",
      content: JSON.stringify(errors)
    })
    return {
      page: query.page,
      data: [],
      totalCount: 0
    }
  }

  return {
    page: query.page,
    data,
    totalCount: totalCount
  }
}
