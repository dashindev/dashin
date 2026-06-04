import React from "react"

function genSpan(len: number) {
  const indents = []
  for (let i = 0; i < len; i++) {
    indents.push(<span key={i} />)
  }
  return indents
}

export default function AnimatedRandomBG() {
  React.useEffect(() => {
    document.title = "Login"
  }, [])
  return (
    <>
      <div className="blurBg">{genSpan(20)}</div>
    </>
  )
}
