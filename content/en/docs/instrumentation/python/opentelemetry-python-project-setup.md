OPENTELEMETRY-PYTHON PROJECT SETUP DOCUMENTATION

**Objective:**
Opentelemetry is a collection of APIs, SDKs, and tools. Use it to instrument, generate, collect, and export telemetry data (metrics, logs, and traces) to help you analyze your software’s performance and behavior.

Opentelemetry code is supported for many popular programming languages like [C++](https://opentelemetry.io/docs/instrumentation/cpp/), [C#/.NET](https://opentelemetry.io/docs/instrumentation/net/), [Erlang/Elixir](https://opentelemetry.io/docs/instrumentation/erlang/), [Go](https://opentelemetry.io/docs/instrumentation/go/), [Java](https://opentelemetry.io/docs/instrumentation/java/), [JavaScript](https://opentelemetry.io/docs/instrumentation/js/), [PHP](https://opentelemetry.io/docs/instrumentation/php/), [Python](https://opentelemetry.io/docs/instrumentation/python/), [Ruby](https://opentelemetry.io/docs/instrumentation/ruby/), [Rust](https://opentelemetry.io/docs/instrumentation/rust/), [Swift](https://opentelemetry.io/docs/instrumentation/swift/) and [Other languages](https://opentelemetry.io/docs/instrumentation/other/)**.**

This is the **Opentelemetry Python project setup documentation**. Opentelemetry is an observability framework – an API, SDK, and tools that are designed to aid in the generation and collection of application telemetry data such as metrics, logs, and traces. This documentation is designed to help you understand how to get started using Opentelemetry Python.

This doc/guide is for Linux environment (WSL2) running on windows platform. For more information about WSL2 refer below URL-

[Windows Subsystem for Linux Documentation | Microsoft Learn](https://learn.microsoft.com/en-us/windows/wsl/)** 

**Step 1- Install WSL2 or WSL2+ Rancher desktop:**
Installation steps are given in appendix must refer that Once installation done go to next steps. 

**Step 2- Open Ubuntu in your machine and set local port:**

**Open Ubuntu in your machine and set local port as below process-**

Inside ubuntu run command-    

*sudo nano /etc/resolv.conf*

then set wsl configuration servers as below-

*nameserver 8.8.8.8*

*nameserver 4.4.4.4*

after that save this modified buffer.


**Step 3-Running Backstage Application in wsl2:**

Fork the below git repository in your personal git account.

[**https://github.com/open-telemetry/opentelemetry-python.git**](https://github.com/open-telemetry/opentelemetry-python.git)

Then cloning the backstage project:
run ***git clone [https://github.com/open-telemetry/opentelemetry-python.git***](https://github.com/open-telemetry/opentelemetry-python.git)***

The cloned code will be available in Linux (WSL2) platform-[**\\wsl.localhost\Ubuntu\root\opentelemetry-python ](\\wsl.localhost\Ubuntu\root\opentelemetry-python )** 

**Step 4-Create Virtual Environment:**

**First create a virtual environment for the project:**

**Virtualenv** is a tool to set up Python environments. Since python3.xx a subset of it has been integrated into the standard library under the venv module. To install venv to host Python by running this command in terminal:

*pip install virtualenv*

For more step-by-step details can be refer from below article-

[How to Set Up a Virtual Environment in Python – And Why It's Useful (freecodecamp.org)](https://www.freecodecamp.org/news/how-to-setup-virtual-environments-in-python/)

In installing virtual environments if facing some issue like *pip not found* then have to resolve that using below commands and again try to create virtual environments.

*pip3 install --upgrade pip*

Using above cmd issue does not resolve then have to try below commands once.

*sudo apt-get update*

*sudo apt install python3-pip*

Once sucessfully done all the process as per mention in creating virtual environment URL, go for next step.

Note: Never forgot to activate virtual environment using below cmd.

*source env/bin/activate*

After activate environment ubuntu terminal looks like below in which env has been mentioned.
<img src = "https://github.com/baravkareknath/opentelemetry.io/tree/main/content/en/docs/instrumentation/python/Images/Aspose.Words.3ae57e89-8582-433f-bd39-27a71e69d800.001.png" width:"800px" height:"300px">

**Step 5- Open Project in editor and connect VS code editor to WSL :**

If we must see project coding part then need of any python editor you can use any editor like PyCharm, Visual Studio as per your comfort.

Here we are going through Visual Studio If in your machine Visual Studio is not installed then we can install it. You can download visual studio latest version .exe file and install it.

Once successfully done installation of visual studio then open project inside it.

Once has been opened then have to connect WSL remote in VS code editor click on Open a Remote Window option as per below:

<img src = "https://github.com/baravkareknath/opentelemetry.io/tree/main/content/en/docs/instrumentation/python/Images/Aspose.Words.3ae57e89-8582-433f-bd39-27a71e69d800.002.png" width:"800px" height:"300px">

First click on windows remote button then click on connect to WSL option as shown in above fig. once VS code editor connect to WSL then open a project folder using project path:

\\wsl.localhost\Ubuntu\root\opentelemetry-python



as shown in below fig.
<img src = "https://github.com/baravkareknath/opentelemetry.io/tree/main/content/en/docs/instrumentation/python/Images/Aspose.Words.3ae57e89-8582-433f-bd39-27a71e69d800.003.png" width:"800px" height:"300px">

After that run project using VS code editor terminal or Ubuntu terminal.

Before running code, never forgot to activate virtual environment using below command- 

source env/bin/activate

then set path in terminal and activate virtual environment like below:

<img src = "https://github.com/baravkareknath/opentelemetry.io/tree/main/content/en/docs/instrumentation/python/Images/Aspose.Words.3ae57e89-8582-433f-bd39-27a71e69d800.004.png" width:"800px" height:"300px">

**Step 6- Run code in VS editor:**

**When trying to run any file then facing some error in initial phase like ModuleNotFoundError as below:**

<img src = "https://github.com/baravkareknath/opentelemetry.io/tree/main/content/en/docs/instrumentation/python/Images/Aspose.Words.3ae57e89-8582-433f-bd39-27a71e69d800.005.png" width:"800px" height:"300px">

## then as per the git repository [**README.md](https://github.com/open-telemetry/opentelemetry-python/tree/main#readme)** file you have install all packages and modules.
First to check and install requirements.txt file modules which are already available in repository using below commands:

*pip freeze > dev-requirements.txt*

*pip install -r dev-requirements.txt*

*pip install -r docs-requirements.txt*

*pip freeze > docs-requirements.txt*

After that facing same issue then install as per error or required module.

e.g. If facing issue like-

<img src = "https://github.com/baravkareknath/opentelemetry.io/tree/main/content/en/docs/instrumentation/python/Images/Aspose.Words.3ae57e89-8582-433f-bd39-27a71e69d800.005.png" width:"800px" height:"300px">

Then use below command:

*sudo apt-get install python3-opentelemetry*

OR

*pip3 install opentelemetry --force-reinstall --upgrade*

After that that issue not resolve then must purge cache using 

*pip cache purge*

and again, go through step-6.

As per the project requirements must install lot of modules one by one using below commands-

Note: The API and SDK packages are available on PyPI, and can be installed via pip.

*pip install opentelemetry-sdk*

*pip install opentelemetry-api*

*pip install opentelemetry-distro*

*pip install opentelemetry-distro[otlp]*

*pip install opentelemetry-instrumentation*

*pip install opentelemetry-contrib-instrumentations*

*pip install opentelemetry-contrib-instrumentations*

*pip install opentelemetry-instrumentation-aio-pika*

*pip install opentelemetry-instrumentation-aiohttp-client*

*pip install opentelemetry-instrumentation-aiopg*

*pip install opentelemetry-instrumentation-asgi*

*pip install opentelemetry-instrumentation-asyncpg*

*pip install opentelemetry-instrumentation-aws-lambda*

*pip install opentelemetry-instrumentation-boto*

*pip install opentelemetry-instrumentation-boto3sqs*

*pip install opentelemetry-instrumentation-botocore*

*pip install opentelemetry-instrumentation-celery*

*pip install opentelemetry-instrumentation-confluent-kafka*

*pip install opentelemetry-instrumentation-dbapi*

*pip install opentelemetry-instrumentation-django*

*pip install opentelemetry-instrumentation-elasticsearch*

*pip install opentelemetry-instrumentation-falcon*

*pip install opentelemetry-instrumentation-fastapi*

*pip install opentelemetry-instrumentation-flask*

*pip install opentelemetry-instrumentation-grpc*

*pip install opentelemetry-instrumentation-httpx*

*pip install opentelemetry-instrumentation-jinja2*

*pip install opentelemetry-instrumentation-kafka-python*

*pip install opentelemetry-instrumentation-logging*

*pip install opentelemetry-instrumentation-mysql*

*pip install opentelemetry-instrumentation-mysqlclient*

*pip install opentelemetry-instrumentation-pika*

*pip install opentelemetry-instrumentation-psycopg2*

*pip install opentelemetry-instrumentation-pymemcache*

*pip install opentelemetry-instrumentation-pymongo*

*pip install opentelemetry-instrumentation-pymysql*

*pip install opentelemetry-instrumentation-pyramid*

*pip install opentelemetry-instrumentation-redis*

*pip install opentelemetry-instrumentation-remoulade*

*pip install opentelemetry-instrumentation-requests*

*pip install opentelemetry-instrumentation-sklearn*

*pip install opentelemetry-instrumentation-sqlalchemy*

*pip install opentelemetry-instrumentation-sqlite3*

*pip install opentelemetry-instrumentation-starlette*

*pip install opentelemetry-instrumentation-system-metrics*

*pip install opentelemetry-instrumentation-tornado*

*pip install opentelemetry-instrumentation-tortoiseorm*

*pip install opentelemetry-instrumentation-urllib*

*pip install opentelemetry-instrumentation-urllib3*

*pip install opentelemetry-instrumentation-wsgi*

*pip install opentelemetry-instrumentation-flask* 

*pip install opentelemetry-instrumentation-requests*

*pip install opentelemetry-semantic-conventions*

*pip install opentelemetry-exporter-jaeger-proto-grpc*

*pip install opentelemetry-exporter-jaeger-thrift*

*pip install opentelemetry-exporter-jaeger*

*pip install opentelemetry-exporter-opencensus*

*pip install opentelemetry-exporter-otlp-proto-common*

*pip install opentelemetry-exporter-otlp-proto-grpc*

*pip install opentelemetry-exporter-otlp-proto-http*

*pip install opentelemetry-exporter-otlp-proto-http*

*pip install opentelemetry-exporter-otlp*

*pip install opentelemetry-exporter-prometheus*

*pip install opentelemetry-exporter-zipkin-json*

*pip install opentelemetry-exporter-zipkin-proto-http*

*pip install opentelemetry-exporter-zipkin*

*pip install opentelemetry-exporter-prometheus-remote-write*

*pip install opentelemetry-exporter-richconsole*

*pip install opentelemetry-exporter-otlp-proto-http*

*pip install opentelemetry-bootstrap -a install*

*pip install opentelemetry-propagator-b3*

*pip install opentelemetry-propagator-jaeger*

*pip install opentelemetry-propagator-aws-xray*

*pip install opentelemetry-propagator-ot-trace*

*pip install opentelemetry-propagator-ot-tracer-traceid*

*pip install opentelemetry-propagator-ot-tracer-spanid*

*pip install opentelemetry-propagator-ot-tracer-sampled*

*pip install opentelemetry-propagator-ot-baggage-\**

*pip install opentelemetry-resource-detector-container*

*pip install opentelemetry-sdk-extension-aws*

*pip install opentelemetry-util-http*

*pip3 install awscli --force-reinstall --upgrade*

*pip install opentelemetry-util-http==0.39b0*

*pip install pytest*

Once completed that installation you can check your installed environment using-

*pip list*

Finally use any testcase file from project and try to run as below fig. if its run successfully without generating any error that means code setup in a local machine successfully done.

<img src = "https://github.com/baravkareknath/opentelemetry.io/tree/main/content/en/docs/instrumentation/python/Images/Aspose.Words.3ae57e89-8582-433f-bd39-27a71e69d800.006.png" width:"800px" height:"300px">




**Appendix:**

**Install WSL command:**

Now install everything need to run WSL with a single command. Open PowerShell or Windows Command Prompt in **administrator** mode by right-clicking and selecting "Run as administrator", enter the wsl --install command, then restart machine.

*wsl --install*

For more steps to install LINUX on Windows with WSL refer below URL-

[Install WSL | Microsoft Learn](https://learn.microsoft.com/en-us/windows/wsl/install)

After successfully installing wsl2 go to Turn windows feature on or off and select following checkbox to be enable.

<img src = "https://github.com/baravkareknath/opentelemetry.io/tree/main/content/en/docs/instrumentation/python/Images/Aspose.Words.3ae57e89-8582-433f-bd39-27a71e69d800.007.png" width:"800px" height:"300px">

Open PowerShell as administrator and execute command 

*wsl –set-default-version-2*

**Step to Installing Ubuntu:**
run the following command in PowerShell to check ubuntu available in wsl2 

<img src = "https://github.com/baravkareknath/opentelemetry.io/tree/main/content/en/docs/instrumentation/python/Images/Aspose.Words.3ae57e89-8582-433f-bd39-27a71e69d800.008.png" width:"800px" height:"300px">

run *wsl –install -d Ubuntu-22.04*** to install latest version of ubuntu in local machine.

Run ubuntu once it’s installed then setup Unix name & password for create an account.

To enable ubuntu to access the internet edit the following file using below command:

*sudo nano /etc/resolv.conf*

**add google DNS in the file to resolve connectivity issue.** 


<img src = "https://github.com/baravkareknath/opentelemetry.io/tree/main/content/en/docs/instrumentation/python/Images/Aspose.Words.3ae57e89-8582-433f-bd39-27a71e69d800.009.png" width:"800px" height:"300px">

now ubuntu will have access to internet using that can install software like yarn, node , git etc..

**Installing Rancher Desktop & setting it to ubuntu:**
Rancher Desktop is delivered as a desktop application. You can download it from the [releases page on GitHub](https://github.com/rancher-sandbox/rancher-desktop/releases) and install it as per the instruction given on [Installation | Rancher Desktop Docs](https://docs.rancherdesktop.io/getting-started/installation).

While installing rancher desktop it will ask for the two options containerd & dockerd , choose dockerd to access docker api & images.


It will automatically install the Kubernetes cluster & configurations.

<img src = "https://github.com/baravkareknath/opentelemetry.io/tree/main/content/en/docs/instrumentation/python/Images/Aspose.Words.3ae57e89-8582-433f-bd39-27a71e69d800.010.png" width:"800px" height:"300px">

**Go to settings in rancher desktop and enable following option to setup ubuntu access with rancher desktop**

<img src = "https://github.com/baravkareknath/opentelemetry.io/tree/main/content/en/docs/instrumentation/python/Images/Aspose.Words.3ae57e89-8582-433f-bd39-27a71e69d800.011.png" width:"800px" height:"300px">

After that running Opentelemetry Application in wsl2.
