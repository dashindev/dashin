const handler = require("serve-handler")
const http = require("http")

const server = http.createServer((request, response) => {
  return handler(request, response, {
    public: "out",
    rewrites: [{ source: "**", destination: "/index.html" }]

    // More options: https://github.com/vercel/serve-handler#options
  })
})

server.listen(5000, () => {
  console.log("Running at http://localhost:5000")
})
