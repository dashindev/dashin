import React, { Dispatch, SetStateAction, useState } from "react"
import { Button, CardActions, CardContent, IconButton } from "@mui/material"
import ViewIcon from "@mui/icons-material/OpenInNew"
import DeleteIcon from "@mui/icons-material/Delete"
import { Translation } from "react-i18next"
import { ConfirmDialog } from "@/components"

interface Props {
  classes: any
  id?: string
  uploading: boolean
  setPreview: Dispatch<SetStateAction<boolean>>
  handleDelMedia: () => void
}

const CardBottomArea = ({
  classes,
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

  return (
    <>
      <CardActions className={classes.BottomArea}>
        <CardContent className={classes.BottomButtons}>
          {!id ? (
            <Button disabled color="primary" size="small">
              <Translation ns="table">{t => t("No image")}</Translation>
            </Button>
          ) : (
            <>
              <IconButton
                disabled={uploading}
                color="primary"
                onClick={id ? () => setPreview(true) : () => null}
                aria-label={id ? "View" : "Upload"}
              >
                <ViewIcon className={classes.BottomIcon} />
              </IconButton>
              <IconButton
                color="primary"
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
                <DeleteIcon className={classes.BottomIcon} />
              </IconButton>
            </>
          )}
        </CardContent>
      </CardActions>
      {/* ConfirmDialog */}
      <ConfirmDialog
        doFunc={handleDelMedia}
        openModal={modalState.open}
        title={modalState.title}
        msg={modalState.msg}
      />
    </>
  )
}

export default CardBottomArea
