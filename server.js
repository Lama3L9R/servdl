const fastify = require('fastify')
const path = require('path')
const fs = require('fs')
const { renderToString } = require('react-dom/server')

const args = process.argv.slice(process.argv.indexOf(__filename) + 1, process.argv.length)
if (!args.length) {
    console.log("Please provide a directory")
    process.exit(-1)
}

const folder = path.join(args[0])

if (!fs.existsSync(folder)) {
    console.log("No such directory")
    process.exit(-1)
}

if (fs.lstatSync(folder).isFile()) {
    console.log("Only directories is accepted")
    process.exit(-1)
}
 
const server = fastify({ logger: false })

server.register(require('@fastify/static'), {
    root: path.resolve(folder),
    prefix: "/downloadStatic"
})

server.register(require('@fastify/vite'), {
    dev: process.argv.includes('--dev'),
    root: __dirname,
    createRenderFunction({ createApp }) {
        return () => {
            return {
                element: renderToString(createApp())
            }
        }
    }
})


server.route({
    method: "GET",
    url: "/*",
    schema: {
        params: {
            dl: {
                type: "boolean",
                default: false
            }
        }
    },
    handler: async (req, rep) => {
        let index = req.url.indexOf("?")

        if (index === -1) {
            index = req.url.length
        }

        const filePath = path.join(folder, req.url.substring(1, index))
        if (!fs.existsSync(filePath)) {
            await rep.code(404).send(`Your request( GET ${filePath} ) dose not exists.`)
        }

        if (fs.lstatSync(filePath).isFile()) {

            if (req.query["dl"]) {
                await rep.header("Content-Disposition", "attachment; filename=" + path.basename(filePath)).sendFile(filePath)
            } else {
                if (fs.lstatSync(filePath).size > 100000) {
                    await rep.send("The file you requested is too big. Please consider use dl=true to download it")
                } else {
                    await rep.sendFile(filePath)
                }
            }        
        } else {
            // rep.html(rep.render())
            // todo render a webpage
        }


    }
})

server.listen({ port: 1145 }).then(() => {
    console.log("Servdl is listening on port 1145.")
}).catch((err) => {
    console.error(err)
    console.log("Failed to start http server on port 1145")
})