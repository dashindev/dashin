import React, { Dispatch, SetStateAction, useState } from "react"
import { ExternalLink, Trash2 } from "lucide-react"
import { Translation } from "react-i18next"
import { ConfirmDialog } from "@/components"

interface Props {
  id?: string
  uploading: boolean
  setPreview: Dispatch<SetStateAction<boolean>>
  handleDelMedia: () => void
}

const CardBottomArea = ({
  id,
  uploading,
  setPreview,
  handleDelMedia
}: Props) => {
  const [modalState, setModalState] = useState({
    open: 0,
    title: <></>,
    msg: <></>
  })

  return <>
    <div className="absolute bottom-0 z-[2] w-full h-9 bg-content-box/50">
      <div className="flex justify-evenly w-full p-0">
        {!id ? (
          <button disabled className="text-primary text-sm opacity-50 cursor-not-allowed">
            <Translation ns="table">{t => t("No image")}</Translation>
          </button>
        ) : (
          <>
            <button
              disabled={uploading}
              className="p-1 text-primary hover:bg-primary/10 rounded disabled:opacity-50"
              onClick={id ? () => setPreview(true) : () => null}
              aria-label={id ? "View" : "Upload"}
            >
              {/* OpenInNew icon */}
              <ExternalLink className="h-5 w-5" />
            </button>
            <button
              className="p-1 text-primary hover:bg-primary/10 rounded"
              aria-label="Delete"
              onClick={() =>
                setModalState({
                  title: (
                    <Translation ns="table">
                      {t => t("Are you sure to delete the file")}
                    </Translation>
                  ),
                  open: modalState.open + 1,
                  msg: (
                    <Translation ns="table">
                      {t => t("All reference will be deleted")}
                    </Translation>
                  )
                })
              }
            >
              {/* Delete icon */}
              <Trash2 className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
    </div>
    {/* ConfirmDialog */}
    <ConfirmDialog
      doFunc={handleDelMedia}
      openModal={modalState.open}
      title={modalState.title}
      msg={modalState.msg}
    />
  </>;
}

export default CardBottomArea
