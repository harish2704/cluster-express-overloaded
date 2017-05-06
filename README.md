# cluster-express-overloaded
It is an express framework boilerkit with clusters module implemented. It is a start-up kit for our applications in node.js specially caring about high traffic and services.

# events
## Service Events
- app.on("servicesSingleLoaded") //Loads services with cluster id  == 0 (folder service-single)
- app.on("servicesMultipleLoaded") //Loads services in all cluster (folder service-multi)

## Email Events
- app.on("beforeEmail", mailOptions) //before initiating emails with options
- app.on("email", err,info) //despite sucess/error
- app.on("emailSent", info) //on success
- app.on("errorOnEmail", err,info) //on error

## App Events
- app.on('booted') //Loaded config, components, overrides and routes

# Components
## Mail Component
- app.components.mail(to,from,subject,text,html,transport = "default")
