/// <reference types="next" />
/// <reference types="next/types/global" />
declare module "react-eva-icons" {
  export type EvaSize = "small" | "medium" | "large" | "xlarge"

  export interface EvaIconProps {
    name: string
    size: EvaSize
    fill?: string
  }

  export default function EvaIcon(
    props: EvaIconProps
  ): React.ReactElement<EvaIconProps>
}
