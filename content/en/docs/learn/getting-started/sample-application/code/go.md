---
headless: true
title: Go
params:
  app-file: main.go
  lib-file: rolldice.go
---

{{% code-block "init" %}}

```bash
go mod init dice
```

{{% /code-block %}} {{% code-block "app-file" %}}

```go
/* main.go */
package main

import (
	"log"
	"net/http"
)

func main() {
	http.HandleFunc("/rolldice", rolldice)

	log.Fatal(http.ListenAndServe(":8080", nil))
}
```

{{% /code-block %}}

{{% code-block "lib-file" %}}

```go
package main

import (
	"io"
	"log"
	"math/rand"
	"net/http"
	"strconv"
)

func rolldice(w http.ResponseWriter, r *http.Request) {
	roll := 1 + rand.Intn(6)

	resp := strconv.Itoa(roll) + "\n"
	if _, err := io.WriteString(w, resp); err != nil {
		log.Printf("Write failed: %v\n", err)
	}
}
```

{{% /code-block %}}

{{% code-block "run-app" %}}

```console
$ node app.js
Listening for requests on http://localhost:8080
```

{{% /code-block %}}
