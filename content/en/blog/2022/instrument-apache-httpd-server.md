---
title: Learn how to instrument Apache Http Server with OpenTelemetry
linkTitle: Learn how to instrument Apache Http Server with OpenTelemetry
date: 2022-05-27
author: Debajit Das
---

If you are using Apache Web Server and in dire need of some telemetry tool to monitor your web server, the OpenTelemetry Apache Module is the right candidate for you: it enables tracing of incoming requests to the server and it will capture the response time of many modules (including mod\_proxy) involved in such an incoming request. With that you will get hierarchical time consumption by each module. This article demonstrates the monitoring capabilities of Apache OpenTelemetry Module and quick guide to get started with the module.

## Getting Started with OpenTelemetry Module
### Building the module

Getting started with the OpenTelemetry module for apache httpd is pretty simple, all you need is a docker engine and git. Download the source code from github and then build the docker image on CentOS7:

```
git clone https://github.com/open-telemetry/opentelemetry-cpp-contrib
cd  instrumentation/otel-webserver-module
docker-compose --profile centos7 build
```

The above command downloads all dependencies required for building OpenTelemetry module for Apache, builds the module and installs the same on the docker image.

**Note**: The above command might take around 1 hour to complete.

When the build is finished,  run the docker image, by typing the following command:
```
docker-compose –profile centos7 up -d
```

The above command  starts up the centos7 image in a docker container named webserver\_centos7 along with the OpenTelemetry Collector and a Zipkin backend.

Apache OpenTelemetry Module will be configured and installed in the desired location and Apache server will be started with Apache OpenTelemetry Module.

### Viewing spans on the backend
As mentioned in [docker-compose.yml](https://github.com/open-telemetry/opentelemetry-cpp-contrib/blob/main/instrumentation/otel-webserver-module/docker-compose.yml), webserver\_centos7 listens on port 9004, zipkin on port 9411 and the OpenTelemetry Collector  on port 4317.
To send  a request to Apache webServer you can either use curl from terminal

```
curl localhost:9004/
```  
Or, you can type ```localhost:9004/``` in any browser.

![Testing](/img/instrument-apache-http-server/testing.png)

Now, traces and spans can be seen on the zipkin backend. To view them, type *localhost:9411* on the browser and click on **Run Query** Button.

![Span-List](/img/instrument-apache-http-server/span-list.png)

This shows a list of queries or endpoints that have been triggered to Apache WebServer.
e.g */noindex/css*

To see the details  click on any of the **SHOW** buttons.

![Span-Hierarchy](/img/instrument-apache-http-server/span-hierarchy.png)

The above shows that as a part of this request, mod\_proxy, mod\_proxy\_balancer and mod\_dav got involved in the request processing and time consumed in each of the modules.

## How can module level details be beneficial ?

To demonstrate the benefits of module level details, we would introduce some artificial delay in a php script and see how the delay gets displayed in the zipkin backend. The following steps are required to be done.

- Login to the container and install the php module.

```
docker exec -it webserver_centos7 /bin/bash
yum install php -y
```

- Add *AddType application/x-httpd-php.html* in */etc/httpd/conf/httpd.conf* as mentioned below:

	![Php-Config](/img/instrument-apache-http-server/php-config.png)

- Create a file named as *index.html* in **/var/www/html** directory and add the following text
  
```
<!DOCTYPE html>
<html>
  <head>
    <title>PHP Test Page</title>
  </head>

  <body>
    <?php
      echo date('h:i:s') . "<br>";
      echo "Introduce delay of 1 seconds" . "<br>";
      sleep(1);
      echo date('h:i:s');
    ?>
  </body>
</html>
	
```

- Restart the apache

```
httpd -k restart
```

- Now, type *"localhost:9004/index.html"* in your browser. You should see something like below
	
	![Php-Response](/img/instrument-apache-http-server/php-response.png)

- Now, traces and spans can be seen on the zipkin backend. To view them, type *"localhost:9411"* on the browser and click on **“Run Query”** Button. To see the details,  click on the **“SHOW”** button corresponding to *‘/index.html.’*
    
    ![Span-Delay](/img/instrument-apache-http-server/span-delay.png)

- We can see that, *"mod\_php5.c\_handler"* consumes around **1 seconds** which contributes to the overall time-consumption of the request.

As the HTTP request flows through individual modules, delay in execution or errors might occur at any of the modules involved in the request. To identify the root cause of any delay or errors in request processing, module wise information (such as response time of individual modules) would enhance the debuggability of the Apache web server.

## Installing OpenTelemetry Module in Target System

To make use of apache OpenTelemetry module, use the following steps to extract the package and install on the target system where apache is installed.

- In order to clone the source code, execute the following 

```
git clone https://github.com/open-telemetry/opentelemetry-cpp-contrib
cd  opentelemetry-cpp-contrib/instrumentation/otel-webserver-module
```
	
- Trigger the build command to generate the package inside the docker image

```	
docker-compose --profile centos7 build
```

The above might take around an hour to build. This would build on Centos 7 image as *apache_centos7*

- Once the build is complete, it's time to extract the image. We need to startup the container which can be done by the following command
	
```
docker run -idt --name <container_name> apache_centos7 /bin/bash
```

The above command would run the container and can be verified using the *“docker ps”* command.

- The generated package inside the container is available inside *“/otel-webserver-module/build”* directory. The same can be extracted to the host system as 

```
docker cp <container_name>:/otel-webserver-module/build/opentelemetry-webserver-sdk-x64-linux.tgz <target-directory>
```

**Note:** The above package should work on any linux distribution having **x86-64** instruction set and glibc version greater than 2.17.
At the point of writing this blog, support for other architectures is not provided.

- Transfer the above package along with [opentelemetry_module.conf](https://github.com/open-telemetry/opentelemetry-cpp-contrib/blob/main/instrumentation/otel-webserver-module/opentelemetry_module.conf) to the target system.

- Uncompress the package **“opentelemetry-webserver-sdk-x64-linux.tgz”** to *“/opt”* directory.
	
```
“tar -xvf opentelemetry-webserver-sdk-x64-linux.tgz -C /opt”
```

- Now, install the module by executing the following
 	
```
cd /opt/opentelemetry-webserver-sdk
./install.sh
``` 	
 	
- In the case of Centos, apache configuration is generally located in */etc/httpd/conf/*. Hence copy the [opentelemetry_module.conf](https://github.com/open-telemetry/opentelemetry-cpp-contrib/blob/main/instrumentation/otel-webserver-module/opentelemetry_module.conf) to */etc/httpd/conf*.

- Edit the */etc/httpd/conf/httpd.conf* and add the following at the end of the file
	**“Include conf/opentelemetry_module.conf”** as below
	
	![Conf](/img/instrument-apache-http-server/conf.png)
	
- Now let’s look at opentelemetry_module.conf and its contents:
	
	- The below LoadFile are the dependent libraries that come with the package.
	
		![Loadfile](/img/instrument-apache-http-server/loadfile.png)
	
	- The below configuration are for the OpenTelemetry Module
		
		![Loadmodule](/img/instrument-apache-http-server/loadmodule.png)

		In the case of Apache 2.2, libmod_apache_otel22.so needs to be used instead of libmod_apache_otel.so

	- The following directive should be ON for the openTelemetry module to be enabled, else it would be disabled.
		
		![enabled](/img/instrument-apache-http-server/enabled.png)

	- Since the module works with the Collector and sends data in oltp format, the following directives are necessary.
		
		![exporter](/img/instrument-apache-http-server/exporter.png)
		
		*ApacheModuleOtelExporterEndpoint* should point to the endpoint of the collector

	- ServiceNamespace, ServiceName and ServiceInstanceId should be provided by the following directives.
		
		![service](/img/instrument-apache-http-server/service.png)
		
	- All other directives are either optional and can be kept as it is for this guide

- To verify whether Apache OpenTelemetry Module is properly enabled into Apache Web Server, type *“httpd -M”* and look for  *“otel_apache_module (shared)”*
	
	![verify-module](/img/instrument-apache-http-server/verify-module.png)
	
- Now, Restart the apache module and open telemetry module should be instrumented.

			

	
	





