import React, { Dispatch, SetStateAction, useState } from "react"
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
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M19 19H5V5h7V3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>
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
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
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
