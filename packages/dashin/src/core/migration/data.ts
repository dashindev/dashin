import { Collection as auth } from "../auth/collections"
import { Columns as auth_columns } from "../auth/columns"

import { Collection as notice } from "../notice/collections"
import { Collection as setting } from "../setting/collections"

import { Columns as notice_columns } from "../notice/columns"
import { Columns as setting_columns } from "../setting/columns"

export const Data = ({ t }: { t: any }) => [
  { name: auth.name, columns: auth_columns({ t }) },
  { name: notice.name, columns: notice_columns({ t }) },
  { name: setting.name, columns: setting_columns({ t }) }
]
