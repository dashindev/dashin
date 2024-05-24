import React, { Dispatch, SetStateAction, useState } from "react"
import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardMedia,
  createStyles,
  Dialog,
  DialogActions,
  IconButton
} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import ZoomInIcon from "@mui/icons-material/ZoomIn"
import ZoomOutIcon from "@mui/icons-material/ZoomOut"
import DownloadIcon from "@mui/icons-material/GetApp"
import { useStyles } from "./styles"
import { BunadminFileType } from "@/components"
import {
  default_file,
  handleImage,
  isImage
} from "@/components/FileExplorer/BunadminFile"
import { ENV } from "@/utils"
import { makeStyles } from "@mui/styles"

interface Props {
  preview: boolean
  setPreview: Dispatch<SetStateAction<boolean>>
  fullScreen?: boolean
  file?: BunadminFileType
  prefix?: string
}

export default function FilePreview({
  preview,
  setPreview,
  fullScreen,
  file,
  prefix
}: Props) {
  const classes = makeStyles(() => {
    return createStyles(useStyles)
  })()
  const [state, setState] = useState({ fullScreen: fullScreen })

  if (!file) return null
  const { created_at, display_name, file_name } = file

  let { url = default_file } = file
  const previewUrl = ENV.FILE_PREVIEW_URL
  url =
    typeof previewUrl === "string"
      ? previewUrl + url
      : prefix
      ? prefix + url
      : url

  function handleFullWidthChange() {
    setState({ ...state, fullScreen: !state.fullScreen })
  }
  const handleClose = () => {
    setPreview(false)
  }

  return (
    <div>
      <Dialog
        fullScreen={state.fullScreen}
        maxWidth="md"
        open={preview}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
      >
        <Card className={classes.cardRoot} onClick={handleClose}>
          <CardActionArea className={classes.cardActionArea}>
            <CardActions className={classes.cardActions}>
              <CardMedia
                style={{ width: "max-content" }}
                component="img"
                image={handleImage(url)}
                alt={display_name || file_name}
                title={display_name || file_name}
                onClick={handleClose}
              />
            </CardActions>
          </CardActionArea>
        </Card>
        <DialogActions className={classes.dialogActions}>
          <Button onClick={handleClose} color="primary">
            {display_name || created_at}
          </Button>

          {isImage(url) && (
            <IconButton aria-label="Preview" onClick={handleFullWidthChange}>
              {!state.fullScreen ? <ZoomInIcon /> : <ZoomOutIcon />}
            </IconButton>
          )}

          <a href={url} target="_blank" rel="noopener noreferrer">
            <IconButton aria-label="Download">
              <DownloadIcon />
            </IconButton>
          </a>

          <IconButton aria-label="Close" onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </DialogActions>
      </Dialog>
    </div>
  )
}
