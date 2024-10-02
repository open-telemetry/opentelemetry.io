---
title: Sample Application
description:
weight: 11
---

The sample application is a "dice game": a game coordinator service will ask
two (or more) player services for a random number between 1 and 6. The player
with the highest number wins.

The first few chapters of this tutorial will focus on the player service, which
is a basic HTTP application, that has an API endpoint `/rolldice` which returns
a random number between 1 and 6 on request.

## Create and launch the player service

Let's begin by setting up a new directory with the source code of the player
service:

```bash
mkdir player-service
cd player-service
```

### Dependencies

In that new directory, run the following command in a terminal window to initialize a new project, and to add all the
dependencies needed.

{{% multicode "init" %}}

### Code

The player service consists of two files: an application file for the logic of the HTTP server, and a library file that
will handle the dice rolling. 

First, create the application file named {{% _var app-file %}} with the following code in it:

{{% multicode "app-file" %}}

Next, create the library file named {{% _var lib-file %}} with the following code in it:

{{% multicode "lib-file" %}}

### Test

Build and run the application with the following command

{{% multicode "run-app" %}}

To verify that your player service is running, either open <http://localhost:8080/rolldice> in your web browser or run the following in the command line:

```bash
curl http://localhost:8080/rolldice
```

For the next sections of the tutorial all you need is the player service, so you can continue with [setting up the OpenTelemetry SDK](../setup-sdk).

You can come back later here, when you will learn how to [correlate telemetry across services](../correlate-across-services/).

## Create and launch the game coordinator

For setting up the game coordinator, create another new directory, that lives
side by side with the player service:

```
cd .. # if you are in the player-service directory
mkdir coordinator-service
cd coordinator-service
```

### Dependencies

The game coordinator has the same dependencies. So, you can run the same code to initialize a new project, and to add all the
dependencies needed.

{{% multicode "init" %}}

### Code

Create the application file named {{% _var app-file %}} with the following code in it:

{{% multicode "coordinator-app" %}}

### Test

To verify that your coordinator service is running and connecting properly to your one player service,  run the following in the command line:

```bash
./game-coordinator
```

Since you only have one player service currently running, you will see something like the following printed to the console:

```text
Player 1 wins: 6
```

## Run multiple player services

To have multiple player compete, go back to the folder of the player service and run a second instance:

{{% multicode "run-app" %}}

## Next Step

After you have setup your sample application, you can continue with [setting up the OpenTelemetry SDK](../sdk-setup/).