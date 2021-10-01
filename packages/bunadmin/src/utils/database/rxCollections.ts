import { Collection as LocalNoticeCollection } from "@/core/notice/collections"
import { Collection as LocalAuthCollection } from "@/core/auth/collections"
import { Collection as LocalSettingCollection } from "@/core/setting/collections"
import { BunadminCollection } from "@/main"

export const rxCollections: BunadminCollection[] = [
  LocalNoticeCollection,
  LocalAuthCollection,
  LocalSettingCollection
]
