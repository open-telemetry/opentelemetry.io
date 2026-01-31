import os
import requests
from bs4 import BeautifulSoup
import re
import concurrent.futures
from urllib.parse import unquote
import json

# edit this map with the event name and the link 
# the link format MUST be <https://your_event_name.sched.com/list/descriptions/?iframe=no>
session_url_map = {
    "KubeCon + CloudNativeCon Europe 2026": "https://kccnceu2026.sched.com/list/descriptions/?iframe=no",
    "Observability Day Europe 2026": "https://colocatedeventseu2026.sched.com/list/descriptions/?iframe=no",
    "Maintainer Summit Europe 2026": "https://maintainersummiteu2026.sched.com/list/descriptions/?iframe=no"
}

# optional: you can also save those HTML to local, it will accelerate the execution.
session_local_file_map = {
    "KubeCon + CloudNativeCon Europe 2026": "./1.html",
    "Observability Day Europe 2026": "./2.html",
    "Maintainer Summit Europe 2026": "./3.html"
}

session_list = []
for eventName, filePath in session_local_file_map.items():
    url = session_url_map[eventName]
    event_domain = url[:-28]

    # uncomment here if you want to do request in real-time
    # response = requests.get(url)
    # topic_soup = BeautifulSoup(response.text, "html.parser")

    # uncomment here if you use local HTML
    with open(filePath, "r") as f:
        content = f.read()
        topic_soup = BeautifulSoup(content, "html.parser")

    # start processing
    sessions = topic_soup.find_all(class_="sched-container-inner")

    # parsing everything
    for session in sessions:
        description = ""
        title = ""
        speakers = []
        starttime = ""
        room = ""
        link = ""

        # find title
        name = session.find(class_="name")    
        title = name.get_text(strip=True)

        link = event_domain + session.find('a', class_='name')['href']

        # find speakers
        roles = session.find(class_="sched-event-details-roles")
        if roles is not None:
            person_list = roles.find_all(class_="sched-person-session")
            for person in person_list:
                company, person_name = "", ""
                if person.find('h2') is not None:
                    person_name = person.find('h2').get_text(strip=True)
                if person.find(class_="sched-event-details-role-company") is not None:
                    company = person.find(class_="sched-event-details-role-company").get_text(strip=True)
                speakers.append({
                    "name": person_name,
                    "company": company
                })

        # find room
        venue = session.find(class_="list-single__location")
        if venue is not None:
            room = venue.get_text(strip=True)

        # find start time
        st = session.find(class_="list-single__date")
        starttime = st.get_text(strip=True)

        # find description
        desc = session.find(class_="tip-description")
        if desc is not None:
            # print(desc)
            for br in desc.find_all('br'):
                br.replace_with('\n')
            t = desc.get_text(strip=False)
            description = t.lstrip().rstrip()

        session_list.append({
            "event_name": eventName,
            "description": description,
            "title":title,
            "speakers": speakers,
            "starttime": starttime,
            "room": room,
            "link": link,
        })

# finding otel related sessions
otel_session = []
keywords = ["otel", "opentelemetry", "ottl", "otlp", "open telemetry"]

# this session list is reviewed manually, it's for KC EU 26 only.
session_title_list = [
"We Deleted Our Observability Stack and Rebuilt It With OTEL: 12 Engineers to 4 at 20K+ Clusters",
"When OTTL Goes Off the Rails: Debugging Transformations with Confidence",
"Schema Inference and Automation: A New Era for Telemetry Management",
"OpenTelemetry Collector SIG: Project Updates",
"OpenTelemetry Logs Driving a Major Shift: Events, Richer Data, and Smarter Semantics",
"OpenTelemetry Project Update and AMA",
"Overcoming OpenTelemetry Adoption Challenges",
"Retroactive Sampling with OpenTelemetry: Cut 90% Distributed Tracing Bandwidth Usage",
"Hello World, Meet the Spanimals: Observability for Beginners",
"How Manual OTel Instrumentation Saves More Than Just Money",
"Jaeger V2: The Maintainers' Guide To OpenTelemetry-Native Tracing",
"📚 Tutorial: Full-Stack Observability on a Budget: A Guide to Strategic Sampling and Data Optimization",
"⚡ Lightning Talk: “Naming Things Is Hard”: A Guide to Naming Using Network Science",
"Enriching Telemetry Signals Through Lookups in the OTel Collector",
"⚡ Lightning Talk: Going Global: Lessons From Internationalizing OpenTelemetry Docs",
"DNS Tracing & Metrics Via eBPF in OpenTelemetry",
"Observing Chaos: Real-Time Monitoring of AI-Driven Kubernetes Destruction",
"Cutting Metrics Traffic, Cutting Costs: The AZ-Aware Observability Blueprint",
"Taming Complexity: Building Observable Workflows With Dapr and OpenTelemetry",
"18 Bluetooth Controllers Walk into a Bar: Observability & Runtime Configuration with CNCF Tools",
"Day-2 Reality Check: Taming Wasteful Telemetry",
"The Fourth Pillar Arrives: OpenTelemetry Profiling Alpha in Action",
]

for each in session_list:
    # uncomment this block and comment the next block if you already have the session list and only want to update the info. 
    # for each_selected in session_title_list:
    #     if each_selected in each["title"]:
    #         otel_session.append(each)
    #         break

    # this block is for finding sessions with relevant keywords.
    for keyword in keywords:
        if keyword in each["title"].lower() or keyword in each["description"].lower():
            otel_session.append(each)
            break

# print them in JSON
# print(json.dumps(otel_session))

# print them in markdown format

for each in otel_session:
    title_without_speaker = each["title"].split(" - ")[0]
    spk = ""
    for spk_info in each["speakers"]:
        spk += spk_info["name"].split(", ")[0] + ", " 
        company_info = ", ".join(spk_info["company"].split(", ")[1:])
        spk += company_info + "; "
    spk = spk.rstrip("; ")
    print("- **[{title}]({url})**<br>by".format(title=title_without_speaker, url=each["link"]))
    print("  {speakers}<br>".format(speakers=spk))
    print("  {starttime}".format(starttime=each["starttime"]))
    print("")


